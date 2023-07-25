// inspired by https://github.com/song940/kelp-static/blob/express/index.js

// this proxy assumes you have codap, building-models and cloud-file-manager all checked out in sibling folders to sage-modeler-site
// the proxy exists to load CODAP, Sage and CFM all with the same domain so cross-iframe communication works as it does in production
// were the same proxy is accomplished using CloudFront behaviors.

import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import * as mime from "mime2";
import * as httpProxy from "http-proxy";

const config = {
  port: 10000,
  endpoints: {
    codap: path.normalize(`${__dirname}/../../../codap/dist/build_0673/`),
    sage: path.normalize(`${__dirname}/../../../building-models/dev/`),
    cfm: path.normalize(`${__dirname}/../../../cloud-file-manager/dist/`),
  }
};

// used to proxy requests to webpack-devserver
const proxy = httpProxy.createProxyServer();

const endpoints = Object.keys(config.endpoints);
const regexString = `^/(${endpoints.join("|")})`;
const endpointRegex = new RegExp(regexString);

// looks up a file within an endpoint
const findFile = (req: http.IncomingMessage, res: http.ServerResponse, endpoint: string, callback: (code: number, err?: string) => void) => {
  const pathname = url.parse(req.url || "").pathname || "";
  let filename = path.join(endpoint, pathname);
  if (filename.indexOf(endpoint) !== 0) {
    return callback(404, `File not found: ${filename}`);
  }
  if (filename.endsWith("/") || filename.endsWith("\\")) {
    filename += "index.html";
  }
  serveFile(req, res, filename, callback);
};

// serves the file or a directory listing
const serveFile = (req: http.IncomingMessage, res: http.ServerResponse, filename: string, callback: (code: number, err?: string) => void) => {
  fs.stat(filename, (err, stat) => {
    if (err) {
      return callback(404, err.toString());
    }
    if (stat.isDirectory()) {
      return serveDirectory(filename, filename, res);
    }
    const mtime = new Date(stat.mtimeMs).toUTCString();
    if (req.headers["if-modified-since"] === mtime) {
      res.writeHead(304);
      return res.end();
    }
    const type = mime.lookup(filename);
    const charset = /^text\/|^application\/(javascript|json)/.test(type) ? "UTF-8" : false;
    res.setHeader("Last-Modified", mtime);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Type", type + (charset ? "; charset=" + charset : ""));
    fs.createReadStream(filename).pipe(res);
  });
};

// serves a directory listing
const serveDirectory = (cwd: string, dir: string, res: http.ServerResponse) => {
  let content = `<h1>Index of ${dir.replace(cwd, "")}</h1><hr />`;
  fs.readdir(dir, (err, files) => {
    content += "<table width=\"50%\">";
    content += "<tr>";
    content += "<td><a href=\"..\">../</a></td>";
    content += "</tr>";
    files.map((filename) => {
      const stat = fs.statSync(path.join(dir, filename));
      filename = filename +  (stat.isDirectory() ? "/" : "");
      content += "<tr>";
      content += `<td><a href="${filename}">${filename}</a></td>`;
      content += `<td>${(stat.mtime || "-")}</td>`;
      content += `<td>${(stat.size)}</td>`;
      content += "</tr>";
    }).join("");
    content += "</table></hr>";
    res.setHeader("Content-Type", "text/html");
    res.end(content);
  });
};

// main server
const options: https.ServerOptions = {
  key: fs.readFileSync(`${__dirname}/devproxy.key`),
  cert: fs.readFileSync(`${__dirname}/devproxy.crt`)
};
const server = https.createServer(options, (req, res) => {
  const done = (code, err) => {
    if (code !== 200) {
      res.statusCode = code;
      res.write(err || "Unknown error");
      res.end();
    }
  };

  const reqUrl = req.url || "";
  console.log(new Date(), reqUrl);

  const pathname = url.parse(reqUrl).pathname || "";
  // codap does not build the index.html file in travis/dist so a local copy is used
  if (pathname === "/codap/static/dg/en/cert/index.html") {
    const filename = path.normalize(`${__dirname}/codap-index.html`);
    serveFile(req, res, filename, done);
  } else {
    // look to see if the path starts with one of our endpoint folders
    const match = reqUrl.match(endpointRegex);
    const endpoint = match ? config.endpoints[match[1]] : undefined;
    if (endpoint) {
      req.url = reqUrl.replace(endpointRegex, "/");
      findFile(req, res, endpoint, done);
    } else {
      // proxy to webpack-devserver
      proxy.web(req, res, { target: "https://localhost:10001", secure: false }, (err) => {
        res.statusCode = 500;
        res.write(err.toString());
        res.end();
      });
    }
  }
});

console.log(`Listening on port ${config.port}`);
server.listen(config.port);
