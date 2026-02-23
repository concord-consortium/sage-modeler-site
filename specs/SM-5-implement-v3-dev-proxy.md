# Implement v3 Dev Proxy

**Jira**: https://concord-consortium.atlassian.net/browse/SM-5

**Status**: **Closed**

## Overview

Create a new dev proxy (`devproxy3`) alongside the existing v2 proxy that enables full-stack local development with CODAP v3, routing `/codap/**` to v3's webpack-dev-server (with static file fallback) instead of pre-built v2 static files. A `CODAP_VERSION` environment variable in the webpack config selects the default CODAP URL, and the existing `?codap=` query parameter can override it.

## Requirements

### R1: New Dev Proxy for CODAP v3

Create a new proxy at `src/devproxy3/index.ts` alongside the existing v2 proxy. Same architecture (HTTPS server on port 10000, routing by URL prefix), but with v3-specific routing:

- Route `/codap/**` to the CODAP v3 webpack-dev-server at `http(s)://localhost:8080/` (stripping the `/codap/` prefix). Bare `/codap` and `/codap/` serve `index.html`.
- On proxy connection error (e.g., ECONNREFUSED), fall back to serving static files from `../codap/v3/dist/`. If `../codap/v3/dist/` doesn't exist, return a 502 with an actionable error message. Static file serving rejects path traversal.
- Keep the same `/sage/**` and `/cfm/**` routes as the existing proxy (disk-based).
- Keep the same default route: proxy non-matching requests to the SageModeler webpack-dev-server at `https://localhost:10001`.
- Use the same self-signed HTTPS certs (`src/devproxy/devproxy.key`, `devproxy.crt`).

### R2: WebSocket Upgrade Handling

Forward WebSocket upgrade requests to the v3 dev server only for URLs matching `/codap/**` or `/assets/**`. All other WebSocket upgrades go to SageModeler's dev server. Known limitation: CODAP v3 HMR does not work through the proxy — developers must manually reload.

### R3: Asset Path Resolution

Add an additional route: `/assets/**` → v3 dev server, preserving the path as-is. Same static fallback applies on proxy connection error.

### R4: HTTP and HTTPS Upstream Support

Support both HTTP and HTTPS upstream via `CODAP_V3_URL` env var (defaults to `http://localhost:8080`). `secure: false` on the CODAP proxy instance only to allow self-signed certs.

### R5: New npm Script

`start:v3` runs the new proxy + SageModeler webpack-dev-server in parallel and opens the browser to `https://localhost:10000/app/?codap=/codap/index.html`.

### R6: v3 URL via Query Parameter

No changes to `codap-iframe-src.ts`. A `CODAP_VERSION` env var in `webpack.config.js` selects the default `codapUrl`:
- `CODAP_VERSION=v3` → `/codap/index.html`
- Otherwise → `/codap/static/dg/en/cert/index.html` (v2 path)
- The `?codap=` query parameter still overrides in both modes.
- v3 branch expansion (short names) deferred until production deployment paths are decided (CODAP-1127 R7).

### R7: Documentation

README updated with: how to run the v3 proxy, required sibling repos and branches, prerequisites for dev-server and static-fallback modes, HTTPS mode instructions, and the HMR limitation.

### R8: Preserve Existing v2 Dev Proxy

The existing v2 proxy at `src/devproxy/index.ts` remains untouched. `npm start` continues to work exactly as before. No modifications to existing scripts.

## Technical Notes

### Existing Dev Proxy Architecture

The current proxy (`src/devproxy/index.ts`) uses `http-proxy` for proxying, `mime2` for MIME types, `fs`/`path` for static serving, self-signed HTTPS certs, and `If-Modified-Since` caching. It does NOT handle WebSocket upgrades.

### SageModeler URL Construction

`src/code/codap-iframe-src.ts` builds the CODAP iframe URL from `window.SageModelerBuildConfig.codapUrl`. The v2-specific branch expansion logic and language substitution are not changed — v3 uses the `lang-override` query param instead.

### Package Dependencies

All dependencies already exist: `http-proxy`, `ts-node`, `npm-run-all`, `opener`, `mime2`.

## Out of Scope

- Changes to CODAP v3 (the proxy works without modifying the CODAP repo)
- Changes to Building Models or Cloud File Manager
- Production deployment / CloudFront routing changes (CODAP-1127 R7)
- Undo/redo implementation (CODAP-1127 R3, separate ticket)
- v2 → v3 document migration
- Automated E2E tests for the proxy

## Decisions

### How should v3 URL construction coexist with v2?
**Context**: The `codap-iframe-src.ts` file hardcodes v2 path patterns. Both v2 (`npm start`) and v3 (`npm run start:v3`) must work from the same codebase.
**Options considered**:
- A) Environment variable (`CODAP_VERSION=v3`) that webpack uses at build time to select the URL pattern
- B) Separate webpack config for v3 overriding only `codapUrl`
- C) Proxy serves a different `codapUrl` value via runtime config endpoint
- D) Use the existing `?codap=` query parameter — default to v2, document that v3 uses `?codap=/codap/index.html`

**Decision**: A combination of A and D. The `dev:server:v3` script sets `CODAP_VERSION=v3` so webpack defaults to `/codap/index.html`. The `?codap=` query parameter still works as an override. `codap-iframe-src.ts` is not changed. Originally option D was chosen (query param only), but during testing it was clear the default needed to work without a query parameter, so the env var approach was added.

---

### How should the v3 proxy handle CODAP v3 asset paths?
**Context**: v3 serves assets at absolute paths like `/assets/index.[hash].js`. When CODAP loads from `/codap/index.html`, the browser requests `/assets/...` which doesn't match `/codap/**`.
**Options considered**:
- A) Add `/assets/**` proxy route to v3 dev server
- B) Configure CODAP v3's webpack to use `publicPath: '/codap/'`
- C) Rewrite asset paths in proxy responses

**Decision**: A) Add `/assets/**` proxy route. Simplest approach, no CODAP v3 changes needed, no conflict risk — no other proxied apps use a top-level `/assets/` path.

---

### Should the v3 proxy support a static file fallback?
**Context**: Useful when developers don't want to run the CODAP v3 dev server. Cross-origin iframe communication prevents using `?codap=<remote-url>`.
**Options considered**:
- A) Auto-detect: proxy to dev server, fall back to `../codap/v3/dist/` on connection error
- B) Explicit env var to switch modes
- C) Always proxy; use deployed builds for static testing

**Decision**: A) Auto-detect. Try to proxy `/codap/**` to the dev server; on connection error, fall back to static files from `../codap/v3/dist/`. Log a message on first fallback. Mental model: dev server running = live development, not running = static files.
