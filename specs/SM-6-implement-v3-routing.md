# SM-6: Implement v3 Routing

**Jira**: https://concord-consortium.atlassian.net/browse/SM-6

**Status**: **Closed**

## Overview

Add CloudFront routing and SageModeler build configuration to serve CODAP v3 alongside the existing v2 deployment. A new `/app-v3/` path hosts a v3-configured SageModeler wrapper for testing, while `/app/` continues to serve v2 unchanged.

## Requirements

### R1: CloudFront Routing for CODAP v3 Builds

A new CloudFront cache behavior and origin must be added to the SageModeler distribution (`E3QXL9V8UMV66L`) to serve CODAP v3 builds from the existing S3 deployment.

- A new origin must be added pointing to `models-resources.s3-website-us-east-1.amazonaws.com` with no origin path
- A new `/codap3/*` cache behavior must route to this origin
- The existing `/releases/*` behavior must remain unchanged
- Stable, branch, and version v3 builds must be accessible
- Hashed asset files must be served with correct MIME types

### R2: v3-Configured SageModeler Build at `/app-v3/`

A second production build of SageModeler, configured for CODAP v3, must be deployed at `/app-v3/`.

- Build with `CODAP_VERSION=v3` so that `codapUrl` is set to `/codap3/index.html`
- Deploy to `s3://models-resources/sagemodeler/app-v3/`
- Asset paths must resolve correctly from the `/app-v3/` prefix
- The existing `/app/` build is unchanged

### R3: SageModeler URL Construction for v3

`src/code/codap-iframe-src.ts` must construct valid CODAP v3 URLs when built with `CODAP_VERSION=v3`.

- No v2-specific `/static/dg/<lang>/cert/` path suffix
- Branch short-name expansion produces v3-compatible paths: `/codap3/branch/${name}/`
- Language path substitution skipped entirely for v3 (v3 uses `lang-override` query param only)
- All existing CODAP query parameters still appended
- `di` and `di-override` parameters unchanged

### R4: Production Webpack Configuration

`webpack.config.js` must support producing production builds that target CODAP v3.

- `CODAP_VERSION` controls both dev and production builds
- Production v3: `codapUrl` = `/codap3/index.html`
- Production v2 (default): `codapUrl` = `/releases/stable/static/dg/en/cert/index.html`
- Dev v3: `codapUrl` = `/codap/index.html` (matching `devproxy3`)

### R5: Query Parameter Override for v3

The `?codap=` query parameter override must work correctly within the v3 build.

- Full paths (containing `/`) pass through unchanged
- Short names expand using the v3 pattern: `/codap3/branch/${name}/`

### R6: Backward Compatibility

v2 routing must continue to work without changes.

- `/app/` continues to use CODAP v2 unchanged
- `?codap=` override works for v2 paths on `/app/`
- Existing bookmarks and `/releases/` URLs unaffected
- v2 dev proxy (`npm start`) remains functional

## Technical Notes

### Target CloudFront Routing

| Path Pattern | Origin | Purpose |
|---|---|---|
| Default (`/*`) | `models-resources.s3/sagemodeler` | SageModeler app (serves both `/app/` and `/app-v3/`) |
| `/releases/*` | `codap-server.concord.org` | CODAP v2 (unchanged) |
| **`/codap3/*`** | **`models-resources.s3`** | **CODAP v3 builds (new)** |
| `/sage/*` | `building-models-app.concord.org.s3` | Building Models (unchanged) |
| `/cfm/*` | `models-resources.s3/cloud-file-manager` | Cloud File Manager (unchanged) |

### Dev vs Production Path Difference

- **Dev mode**: `codapUrl` = `/codap/index.html` (matching `devproxy3`)
- **Production v3 build**: `codapUrl` = `/codap3/index.html` (matching CloudFront behavior)
- **Production v2 build**: `codapUrl` = `/releases/stable/static/dg/en/cert/index.html` (unchanged)

All paths are root-relative (same-origin) — CODAP must be served from the same CloudFront distribution as SageModeler.

### CloudFront Cache Behavior Configuration

The `/codap3/*` cache behavior uses the same configuration as `/codap-dev/*`:
- Query string forwarding enabled
- Short TTL for `index.html`, long TTL for hashed assets
- No cache invalidation needed (new path)
- Origin uses S3 website hosting endpoint (no OAC support; bucket already public)

**Important**: The CloudFront origin must have **no origin path**. Setting an origin path of `/codap3` would produce double-prefixed requests (`/codap3/codap3/...`).

### v3 URL Pattern

Where v2 uses `/releases/{build}/static/dg/{lang}/cert/index.html`, v3 uses:
- `/codap3/index.html` — stable build
- `/codap3/version/{version}/index.html` — specific version
- `/codap3/branch/{branch-name}/index.html` — branch build

### Language Handling

v2 encodes language in the URL path. v3 uses `lang-override` query parameter only. The language path substitution in `codap-iframe-src.ts` is skipped for v3 builds to avoid corrupting branch names containing `/en/`.

## Out of Scope

- CODAP v3 Vite `base` configuration (owned by CODAP v3 repo)
- Changes to Building Models or Cloud File Manager
- CODAP v3 CI/CD pipeline for deploying CODAP builds to S3 (already exists)
- Switching `/app/` to use v3 as the default (see Future Work below)
- Changes to the v3 dev proxy (`devproxy3`) — already works
- Restricting `?codap=` to same-origin paths — existing behavior preserved
- Staging CloudFront distribution — vestigial, not currently used

## Future Work: Cutting Over `/app/` to v3

When CODAP v3 is ready to become the default for SageModeler (all blockers resolved, testing complete), the cutover involves:

1. **Change the v2 build's `codapUrl`** in `webpack.config.js` to point to `/codap3/index.html` instead of `/releases/stable/static/dg/en/cert/index.html` — or, more simply, make `CODAP_VERSION=v3` the default in the production build
2. **Update `codap-iframe-src.ts`** so the default branch expansion and language handling use the v3 patterns (this will already be implemented by this story for the v3 build; the cutover just makes it the default)
3. **Deploy the updated build to `/app/`** — `sagemodeler.concord.org/app/` now loads CODAP v3
4. **Keep `/app-v3/` running** during a transition period for rollback capability
5. **Optionally remove the `/app-v3/` path** once v3 is stable as the default
6. **Optionally keep `/releases/*` routing** for a deprecation period in case any external links point directly to v2 CODAP paths on the SageModeler domain

The cutover does not require any CloudFront changes — the `/codap3/*` behavior is already in place, and the default behavior already serves both `/app/` and `/app-v3/`.

## Decisions

### What CloudFront path prefix should CODAP v3 builds use on the SageModeler distribution?
**Context**: CODAP v3 builds need to be served from the SageModeler CloudFront distribution so the v3 wrapper at `/app-v3/` can load them from the same origin.
**Options considered**:
- A) `/codap/*` — Mirrors the dev proxy path. Clean and consistent with local development.
- B) `/codap3/*` — More descriptive, uses the existing `/codap-dev/*` naming pattern as precedent.

**Decision**: B) `/codap3/*`. Matches the S3 key prefix (`models-resources/codap3/`) exactly, so CloudFront path mapping works without rewriting. The dev proxy continues to use `/codap/` for local development.

---

### Where should v3 builds be deployed in S3?
**Context**: v3 static builds need an S3 location for the CloudFront origin.

**Decision**: v3 builds are already deployed at `s3://models-resources/codap3/`. The SageModeler distribution adds a new origin pointing to the same S3 website endpoint.

---

### Should production default switch to v3 as part of this story?
**Context**: The parent spec (CODAP-1127) has other blockers that need to be resolved first.

**Decision**: No. `/app/` remains v2. A separate v3-configured build is deployed at `/app-v3/` for testing only.

---

### How should the `?codap=` override distinguish v2 vs v3 short names?
**Context**: Short branch names expand differently for v2 vs v3.

**Decision**: Each build uses its own expansion pattern determined by the build-time `CODAP_VERSION` flag. No disambiguation needed — v2 builds expand to `/releases/...`, v3 builds expand to `/codap3/branch/...`.

---

### Should staging CloudFront be updated?
**Context**: The staging distribution has the same v2 routing structure.

**Decision**: No. The staging distribution is vestigial and not currently used.

---

### How should v3 builds be detected at runtime?
**Context**: `codap-iframe-src.ts` needs to know whether to use v2 or v3 URL patterns. URL-sniffing (`!options.codap.includes("/releases/")`) would fail for v2 dev mode (whose URL doesn't contain `/releases/`).

**Decision**: Inject `codapVersion` as a build-time string via `SageModelerBuildConfig`, sourced from `CODAP_VERSION` in webpack. Code derives `useCodap3 = codapVersion === "v3"` at runtime. This is the single source of truth — no URL-sniffing.

---

### CloudFront origin path configuration
**Context**: Setting both an origin path of `/codap3` and a cache behavior pattern of `/codap3/*` would double-prefix requests.

**Decision**: Use no origin path on the CloudFront origin. The `/codap3/*` behavior forwards the full viewer path to S3, where `codap3/` is already the S3 key prefix. This matches how `/codap-dev/*` already works.

---

### Language path substitution for v3
**Context**: v2 replaces `/en/` with `/${lang}/` in the URL path. Applying this to v3 branch URLs could corrupt branch names containing `/en/`.

**Decision**: Skip language path substitution entirely for v3 builds. v3 uses the `lang-override` query parameter only.

---

### S3 website hosting endpoint `index.html` for branch paths
**Context**: v3 branch expansion produces paths like `/codap3/branch/foo/` — does the trailing `/` resolve to `index.html`?

**Decision**: Yes. The S3 website hosting endpoint automatically serves `index.html` for directory paths, so no explicit `index.html` append is needed in the expansion pattern.

---

### CloudFront cache invalidation
**Context**: Adding a new cache behavior could interact with cached responses.

**Decision**: No invalidation needed. `/codap3/*` is a brand new path with no existing cached objects.

---

### v3 dev wrapper path
**Context**: With `appPrefix = isV3 ? "app-v3" : "app"` applied in dev mode, the v3 dev wrapper moves from `/app/` to `/app-v3/`.

**Decision**: Update `dev:browse:v3` to open `/app-v3/` to match. In dev mode only one build runs at a time, so there's no conflict.

---

### CI/CD assumption
**Context**: The spec assumes `s3-deploy-action@v1` runs the repo's `build` script and uploads the full `dist/` directory.

**Decision**: Noted as an explicit assumption to verify before merging. No CI workflow file changes are needed if the assumption holds.
