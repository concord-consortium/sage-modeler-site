// src/devproxy3/index.ts

import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import * as mime from "mime2";
import * as httpProxy from "http-proxy";

// --- Config ---

const PORT = 10000;
const CODAP_V3_DEV_SERVER = process.env.CODAP_V3_URL || "http://localhost:8080";
const SAGE_MODELER_DEV_SERVER = "https://localhost:10001";

const CODAP_V3_DIST = path.resolve(__dirname, "../../../codap/v3/dist");
const SAGE_DIR = path.resolve(__dirname, "../../../building-models/dev");
const CFM_DIR = path.resolve(__dirname, "../../../cloud-file-manager/dist");

// --- Proxy instances ---

// Proxy for CODAP v3 dev server (http by default; R4 supports https)
const codapProxy = httpProxy.createProxyServer({
  target: CODAP_V3_DEV_SERVER,
  secure: false, // R4: allow self-signed certs on v3 upstream only
});

// Proxy for SageModeler webpack-dev-server
// secure: false needed here too — SageModeler dev server uses self-signed certs (same as v2 proxy)
const sageProxy = httpProxy.createProxyServer({
  target: SAGE_MODELER_DEV_SERVER,
  secure: false,
});

// --- Proxy error handlers (prevent unhandled errors from crashing Node) ---

codapProxy.on("error", (err, req, res) => {
  console.error("[devproxy3] CODAP proxy error:", err.message);
  if (res instanceof http.ServerResponse && !res.headersSent) {
    res.writeHead(502);
    res.end("CODAP v3 proxy error");
  }
});

sageProxy.on("error", (err, req, res) => {
  console.error("[devproxy3] SageModeler proxy error:", err.message);
  if (res instanceof http.ServerResponse && !res.headersSent) {
    res.writeHead(502);
    res.end("SageModeler proxy error");
  }
});

// --- Static file fallback ---

let loggedFallback = false;

const serveStaticFile = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  filePath: string
) => {
  const resolved = path.resolve(filePath);
  fs.stat(resolved, (err, stat) => {
    if (err) {
      res.writeHead(404);
      res.end(`Not found: ${req.url}`);
      return;
    }
    if (stat.isDirectory()) {
      // Serve index.html for directories
      serveStaticFile(req, res, path.join(resolved, "index.html"));
      return;
    }
    // If-Modified-Since caching
    const mtime = new Date(stat.mtimeMs).toUTCString();
    if (req.headers["if-modified-since"] === mtime) {
      res.writeHead(304);
      res.end();
      return;
    }
    const type = mime.lookup(resolved) || "application/octet-stream";
    const charset = /^text\/|^application\/(javascript|json)/.test(type) ? "UTF-8" : false;
    res.setHeader("Last-Modified", mtime);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Type", type + (charset ? "; charset=" + charset : ""));
    fs.createReadStream(resolved).pipe(res);
  });
};

const serveCodapFallback = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  filePath: string
) => {
  // Path traversal protection: resolve and verify within CODAP v3 dist root
  const resolved = path.resolve(filePath);
  if (resolved !== CODAP_V3_DIST && !resolved.startsWith(CODAP_V3_DIST + "/")) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  // Check if dist directory exists
  if (!fs.existsSync(CODAP_V3_DIST)) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end(
      `CODAP v3 dev server not running and ${CODAP_V3_DIST} not found.\n` +
      `Run \`npm start\` in ../codap/v3/ or build with \`npm run build\` to create dist/`
    );
    return;
  }
  if (!loggedFallback) {
    console.log(`[devproxy3] CODAP v3 dev server not available, serving static files from ${CODAP_V3_DIST}`);
    loggedFallback = true;
  }
  serveStaticFile(req, res, filePath);
};

// --- Static file serving for /sage/** and /cfm/** (same as v2) ---

const diskEndpoints: Record<string, string> = {
  sage: SAGE_DIR,
  cfm: CFM_DIR,
};

const serveDiskEndpoint = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  endpointDir: string,
  subPath: string
) => {
  let filePath = path.join(endpointDir, subPath);
  if (filePath.indexOf(endpointDir) !== 0) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  if (subPath === "" || subPath === "/") {
    filePath = path.join(filePath, "index.html");
  }
  serveStaticFile(req, res, filePath);
};

// --- Route matching ---

const getCodapSubPath = (pathname: string): string | null => {
  if (pathname === "/codap" || pathname === "/codap/") { return "/"; }
  if (pathname.startsWith("/codap/")) { return pathname.slice(6); } // strip "/codap"
  return null;
};

const getAssetsMatch = (pathname: string): boolean => {
  return pathname.startsWith("/assets/") || pathname === "/assets";
};

const getDiskEndpoint = (pathname: string): { key: string; subPath: string } | null => {
  for (const key of Object.keys(diskEndpoints)) {
    const prefix = `/${key}/`;
    if (pathname.startsWith(prefix)) {
      return { key, subPath: pathname.slice(prefix.length - 1) }; // keep leading /
    }
    if (pathname === `/${key}`) {
      return { key, subPath: "/" };
    }
  }
  return null;
};

// --- Request handler ---

const handleRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const reqUrl = req.url || "";
  const pathname = url.parse(reqUrl).pathname || "";
  console.log(new Date().toISOString(), reqUrl);

  // 1. /codap/** → proxy to v3 dev server (strip /codap prefix)
  const codapSubPath = getCodapSubPath(pathname);
  if (codapSubPath !== null) {
    req.url = reqUrl.replace(/^\/codap(\/|$)/, "/");
    codapProxy.web(req, res, {}, (err) => {
      // Fallback to static files on connection error.
      // Note: path.join (not path.resolve) is used intentionally — it concatenates
      // segments even when they start with "/", so the base directory is preserved.
      const staticPath = codapSubPath === "/" ? "/index.html" : codapSubPath;
      serveCodapFallback(req, res, path.join(CODAP_V3_DIST, staticPath));
    });
    return;
  }

  // 2. /assets/** → proxy to v3 dev server (preserve path as-is)
  if (getAssetsMatch(pathname)) {
    codapProxy.web(req, res, {}, (err) => {
      serveCodapFallback(req, res, path.join(CODAP_V3_DIST, pathname));
    });
    return;
  }

  // 3. /sage/** and /cfm/** → serve from disk
  const diskMatch = getDiskEndpoint(pathname);
  if (diskMatch) {
    serveDiskEndpoint(req, res, diskEndpoints[diskMatch.key], diskMatch.subPath);
    return;
  }

  // 4. Everything else → proxy to SageModeler webpack-dev-server
  sageProxy.web(req, res, {}, (err) => {
    res.writeHead(500);
    res.end(err.toString());
  });
};

// --- HTTPS server ---

const options: https.ServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "../devproxy/devproxy.key")),
  cert: fs.readFileSync(path.join(__dirname, "../devproxy/devproxy.crt")),
};

const server = https.createServer(options, handleRequest);

// --- WebSocket upgrade handling (R2) ---

server.on("upgrade", (req, socket, head) => {
  const pathname = url.parse(req.url || "").pathname || "";

  // Forward /codap/** and /assets/** upgrades to CODAP v3; all others to SageModeler
  if (getCodapSubPath(pathname) !== null) {
    req.url = (req.url || "").replace(/^\/codap(\/|$)/, "/");
    codapProxy.ws(req, socket, head);
  } else if (getAssetsMatch(pathname)) {
    codapProxy.ws(req, socket, head);
  } else {
    // All other WebSocket upgrades go to SageModeler dev server
    sageProxy.ws(req, socket, head);
  }
});

// --- Start ---

console.log(`[devproxy3] Listening on https://localhost:${PORT}`);
console.log(`[devproxy3] CODAP v3 dev server: ${CODAP_V3_DEV_SERVER}`);
console.log(`[devproxy3] SageModeler dev server: ${SAGE_MODELER_DEV_SERVER}`);
server.listen(PORT);
