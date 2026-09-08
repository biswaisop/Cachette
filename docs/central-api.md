# Cachette Central API Contract

> **Document Status**: Active Reference for Node Contributors  
> **Source Tracking**: Issue #35 — Document the central API contract  
> **Classification**: Open-Core Interface Specification  

---

## 1. Purpose & Scope

Cachette is built on an **open-core, distributed architecture** comprising two physically separate repositories:
1. **`cachette-node` (Public / Open Source)**: The software that runs on user machines (laptops, spare PCs, home servers). It manages local disk storage via MinIO, runs a local FastAPI app, and exposes an outbound-only Cloudflare Tunnel.
2. **`cachette-central` (Private / Proprietary Hosted Service)**: The cloud orchestration layer operated at `cachette.cloud`. It handles global user accounts, node registration, DNS/subdomain routing, tunnel token issuance, share-link resolution, heartbeat aggregation, and entitlement checks.

### Why This Document Exists
Contributors to the public `cachette-node` repository do **not** have access to the private `cachette-central` source code. This document defines the **contractual interface** between Node and Central. Node contributors can write, test, mock, and maintain all node-side networking and background integration against this specification without needing access to Central's internal code.

---

## 2. Information Classification & Authority

To prevent hallucinations and distinguish implemented code from forward-looking architectural design, all information in this specification is categorized into one of three tiers:

| Tier | Category | Description in this Repo |
| :--- | :--- | :--- |
| **Tier 1** | **Confirmed from Node Repository** | Implemented models, schemas, configs, or routes directly present in `backend/app/` or `frontend/`. |
| **Tier 2** | **Confirmed from Central Repository** | Authoritative schemas from `cachette-central`. *(Note: `cachette-central` is not present in this workspace; fields marked as requiring central synchronization).* |
| **Tier 3** | **Architectural Intent** | Explicitly specified in [`CACHETTE_ROADMAP.md`](file:///d:/Cachette/CACHETTE_ROADMAP.md) (§3, §5, §9, §11, §14), outlining planned endpoints, payloads, and workflows. |

> [!IMPORTANT]
> Where exact header names, payload fields, or token expiry intervals are not yet bound by a production Central deployment, they are explicitly designated as **`[Needs Central Confirmation]`** with recommended defaults.

---

## 3. Architecture Boundary: Central vs. Node

The core invariant of Cachette is:
> **Central is thin, metadata-focused, and bandwidth-cheap. Central NEVER stores, proxies, or handles file bytes.**

### Responsibility Matrix

```
                      +------------------------------------------+
                      |         cachette.cloud (Central)         |
                      |   - User accounts & auth                 |
                      |   - Node registry & subdomains           |
                      |   - Cloudflare Tunnel tokens             |
                      |   - Share link routing (/s/<token>)      |
                      |   - Heartbeat aggregation & online status|
                      |   - AI / RAG query broker                |
                      +------------------------------------------+
                                    /              \
         Registration / Heartbeat  /                \  Share Link Resolution /
                                  v                  v  Brokered Transfers
               +-----------------------+        +-----------------------+
               |      User Node A      |        |      User Node B      |
               | (Friend's Old Laptop) |        |    (Home Server)      |
               | - MinIO / Local Disk  |<======>| - MinIO / Local Disk  |
               | - Local Postgres      | Direct | - Local Postgres      |
               | - FastAPI File Engine | Tunnel | - FastAPI File Engine |
               | - cloudflared tunnel  |Transfer| - cloudflared tunnel  |
               +-----------------------+        +-----------------------+
```

| Area | Node Responsibility (`cachette-node`) | Central Responsibility (`cachette-central`) |
| :--- | :--- | :--- |
| **Storage** | MinIO / local disk stores all encrypted or raw file chunks. | **None**. Zero file bytes touch Central. |
| **File Metadata** | Node-scoped filenames, folder hierarchy, S3 keys, sizes, hashes, and MIME types in local Postgres. | Does **not** keep local directory trees. Only knows `(node_id, file_id)` tuples for active public shares. |
| **File Operations** | Uploads (single/multipart), downloads, previews, renames, local deletions, LibreOffice conversions. | Never proxies file payloads. Only resolves incoming requests to target node subdomains. |
| **Authentication** | Node API session verification, local admin tokens, internal transfer verification tokens. | Master user accounts, JWT issuance, password reset OTPs, session revocation. |
| **Networking & DNS** | Runs `cloudflared` outbound tunnel daemon using token provided by Central. No inbound ports open. | Provisions `node-subdomain.cachette.cloud` via Cloudflare API and issues tunnel credentials. |
| **Heartbeat & Health** | Emits periodic pings to Central with node health, uptime, and disk usage metrics. | Aggregates heartbeats, tracks `last_seen_at`, marks nodes `online` or `offline` for graceful UX. |
| **Cross-Node Copy** | Streams bytes peer-to-peer over Cloudflare Tunnel directly between nodes. | Issues short-lived transfer authorization tokens; brokers permissions. |

---

## 4. Central Data Flow & Privacy Rules

To protect user privacy and minimize Central operational costs, strict boundaries dictate what data can leave the node:

### What Data MAY Be Sent to Central
1. **Node registration data**: User ID, assigned node name/subdomain request, node system capabilities (optional).
2. **Heartbeat pings**: Node ID, timestamp, status (`online`/`degraded`), software version, storage utilization percent.
3. **Share link registrations**: Unique share token, `node_id`, internal `file_id`, permission tier (`view` vs `download`), expiration timestamp, max use limits.
4. **Transfer completion notifications**: Transfer session ID, source/destination node IDs, success/failure status (no content).

### What Data MUST NEVER Be Sent to Central
1. **File contents / byte streams**: Uploads and downloads must stream directly to/from the node's tunnel or LAN.
2. **Local directory structures**: Private folders and filenames not explicitly shared remain solely in the node's local database.
3. **Storage credentials**: MinIO root keys, local database passwords, and encryption keys must never leave the node.

---

## 5. Base URL, Protocols & Versioning

- **Production Central Base URL**: `https://cachette.cloud`
- **Staging / Local Central Base URL**: Configurable via node environment variable `CENTRAL_API_BASE_URL` (default: `http://localhost:8000` during centralized local testing).
- **API Versioning**: Central routes are prefixed with `/api/v1` (or legacy `/api` aliases as documented below).
- **Transport Protocol**: HTTPS strictly required for all remote production calls.
- **Data Format**: `application/json` for all request and response bodies.

---

## 6. Authentication & Node Identity

Node-to-Central calls require authentication so Central can verify the calling node belongs to the authenticated user account:

1. **User JWT Token (Bearer Auth)**:
   - Used during initial node registration or user-initiated claiming:
     ```http
     Authorization: Bearer <user_access_token>
     ```
2. **Node Secret Key / API Token (X-Node-Token)**:
   - Issued by Central during registration (`POST /api/nodes/register`).
   - Stored securely in the node's `.env` or local database as `NODE_SECRET_KEY`.
   - Included in recurring calls (such as heartbeats and share registrations):
     ```http
     X-Node-Id: <node_uuid>
     X-Node-Token: <node_secret_token>
     ```
   - *Status*: `[Tier 3 — Architectural Intent / Needs Central Confirmation]`.

---

## 7. Central API Endpoint Reference

### 7.1. Node Registration

#### `POST /api/nodes/register`
- **Classification**: Tier 3 (`CACHETTE_ROADMAP.md` §3, §9, §11)
- **Purpose**: Registers a newly installed node under the authenticated user's account. Triggers Central to automate Cloudflare Tunnel creation, register DNS for `{node_subdomain}.cachette.cloud`, and issue a tunnel token for the node's `cloudflared` client.
- **Caller**: Node onboarding wizard, CLI installer, or first-run container initialization.
- **Authentication**: `Authorization: Bearer <user_access_token>`

#### Request Headers
```http
POST /api/v1/nodes/register HTTP/1.1
Host: cachette.cloud
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request Body
```json
{
  "node_name": "livingroom-laptop",
  "requested_subdomain": "chirag-home",
  "client_version": "0.1.0",
  "system_info": {
    "os": "linux",
    "arch": "x86_64",
    "storage_backend": "minio"
  }
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `node_name` | `string` | Yes | Human-readable label for the user's dashboard. |
| `requested_subdomain` | `string` | No | Desired prefix for `subdomain.cachette.cloud`. If omitted or taken, Central generates one. |
| `client_version` | `string` | Yes | Node software release version. |
| `system_info` | `object` | No | Optional hardware profile for compatibility checks. |

#### Response (`201 Created`)
```json
{
  "node_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "subdomain": "chirag-home.cachette.cloud",
  "tunnel_token": "eyJhIjoiY2xvdWRmbGFyZS10dW5uZWwtdG9rZW4iLCJ0Ijoi...",
  "node_token": "cct_sec_8f4a1c9e7b2d5a3f...",
  "heartbeat_interval_seconds": 60,
  "created_at": "2026-09-08T12:00:00Z"
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `node_id` | `uuid` | Globally unique identifier assigned to this node. |
| `subdomain` | `string` | Fully qualified public domain routing to this node via Cloudflare. |
| `tunnel_token` | `string` | Cloudflare Tunnel token passed to `cloudflared --token <token>`. |
| `node_token` | `string` | Long-lived secret used by the node for subsequent heartbeat and share calls. |
| `heartbeat_interval_seconds` | `integer` | Required frequency for heartbeat emissions. |

#### Error Codes
- `400 Bad Request`: Invalid node name or unsupported parameters.
- `401 Unauthorized`: Missing or invalid user access token.
- `409 Conflict`: Subdomain already allocated to another user.
- `403 Forbidden`: User reached their node quota limit (`nodes_allowed(user)` limit).

---

### 7.2. Node Heartbeat & Status Tracking

#### `POST /api/nodes/heartbeat`
- **Classification**: Tier 3 (`CACHETTE_ROADMAP.md` §3, §9, §11)
- **Purpose**: Periodic ping sent by active nodes to notify Central that the node is online, connected, and reachable. Allows Central to display live online/offline indicators and gracefully handle requests when the host machine is asleep or disconnected.
- **Caller**: Node background daemon / scheduler (e.g. every 60 seconds).
- **Authentication**: `X-Node-Id` and `X-Node-Token` (or Bearer Token)

#### Request Headers
```http
POST /api/v1/nodes/heartbeat HTTP/1.1
Host: cachette.cloud
Content-Type: application/json
X-Node-Id: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
X-Node-Token: cct_sec_8f4a1c9e7b2d5a3f...
```

#### Request Body
```json
{
  "timestamp": "2026-09-08T12:05:00Z",
  "status": "healthy",
  "storage_used_bytes": 14285714285,
  "storage_total_bytes": 500107862016,
  "active_transfers": 0,
  "uptime_seconds": 86400
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `timestamp` | `ISO-8601 string` | Yes | Node's current local timestamp (UTC). |
| `status` | `string` | Yes | Node state (`healthy`, `degraded`, `shutting_down`). |
| `storage_used_bytes` | `integer` | No | Current local storage consumed on disk. |
| `storage_total_bytes` | `integer` | No | Total local storage capacity on disk. |
| `active_transfers` | `integer` | No | Concurrent peer transfers currently active. |
| `uptime_seconds` | `integer` | No | Total consecutive uptime in seconds. |

#### Response (`200 OK`)
```json
{
  "acknowledged": true,
  "server_time": "2026-09-08T12:05:01Z",
  "next_heartbeat_seconds": 60,
  "commands": []
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `acknowledged` | `boolean` | Confirms Central logged the heartbeat. |
| `server_time` | `ISO-8601 string` | Central's current clock time (helps detect clock drift). |
| `next_heartbeat_seconds` | `integer` | Dynamic adjustment to ping interval (e.g., during high load). |
| `commands` | `array` | Optional control signals from Central (e.g. `refresh_tunnel`, `revoke_share`). |

#### Error Codes
- `401 Unauthorized`: Invalid or unrecognized node token.
- `404 Not Found`: Node ID has been deleted or unlinked from user account.
- `429 Too Many Requests`: Heartbeat interval breached rate limiter.

---

### 7.3. Share Link Registration

#### `POST /api/shares`
- **Classification**: Tier 1 model alignment (`ShareLink` in `models/share_link.py`) / Tier 3 (`CACHETTE_ROADMAP.md` §5)
- **Purpose**: When a user creates a public or friend share on their node, the node registers a resolution pointer with Central. This allows `cachette.cloud/s/<token>` to resolve to the node without exposing internal tunnel credentials.
- **Caller**: Node FastAPI application upon user action in the web UI.
- **Authentication**: `X-Node-Id` + `X-Node-Token`

#### Request Body
```json
{
  "share_token": "a1b2c3d4e5f6g7h8",
  "file_id": "4d76f0c1-3482-4217-a068-185e786b3cc7",
  "filename": "project_demo.mp4",
  "content_type": "video/mp4",
  "size_bytes": 104857600,
  "permission": "view",
  "expires_at": "2026-09-15T00:00:00Z",
  "max_uses": 10
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `share_token` | `string` | Yes | URL-safe token (16 to 64 characters) matching local `ShareLink.token`. |
| `file_id` | `uuid` | Yes | Local file UUID on the node. |
| `filename` | `string` | Yes | File display name shown on the preview page. |
| `content_type` | `string` | No | MIME type (e.g. `video/mp4`, `image/png`). |
| `size_bytes` | `integer` | Yes | File size in bytes for UI preview. |
| `permission` | `string` | Yes | Access tier: `"view"` (inline preview only) or `"download"`. |
| `expires_at` | `ISO-8601 string` | No | UTC expiration timestamp (null for indefinite). |
| `max_uses` | `integer` | No | Maximum permitted accesses before invalidation. |

#### Response (`201 Created`)
```json
{
  "share_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "public_url": "https://cachette.cloud/s/a1b2c3d4e5f6g7h8",
  "status": "active"
}
```

---

### 7.4. Share Link Resolution

#### `POST /api/shares/resolve` (or `GET /s/{token}`)
- **Classification**: Tier 3 (`CACHETTE_ROADMAP.md` §3, §5, §9)
- **Purpose**: Used when an external recipient opens `https://cachette.cloud/s/{token}`. Central checks if the owner node is currently online (via heartbeat) and returns either a direct redirect or proxy target to the node's tunnel preview URL.
- **Caller**: Central frontend or external client browser.
- **Authentication**: Public (no credentials required).

#### Request Body (for API lookup)
```json
{
  "token": "a1b2c3d4e5f6g7h8"
}
```

#### Response (`200 OK` — Node Online)
```json
{
  "status": "online",
  "permission": "view",
  "filename": "project_demo.mp4",
  "content_type": "video/mp4",
  "size_bytes": 104857600,
  "target_preview_url": "https://chirag-home.cachette.cloud/files/4d76f0c1-3482-4217-a068-185e786b3cc7/preview?st=a1b2c3d4e5f6g7h8",
  "owner_node": {
    "node_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "livingroom-laptop",
    "is_online": true,
    "last_seen": "2026-09-08T12:05:00Z"
  }
}
```

#### Response (`200 OK` — Node Offline)
```json
{
  "status": "offline",
  "message": "The host node for this file is currently offline or asleep.",
  "filename": "project_demo.mp4",
  "owner_node": {
    "node_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "is_online": false,
    "last_seen": "2026-09-08T10:14:22Z"
  }
}
```

#### Error Codes
- `404 Not Found`: Share token is invalid or has been revoked.
- `410 Gone`: Share link has expired or reached its `max_uses`.

---

### 7.5. Cross-Node Transfer Authorization (Brokered Copy/Paste)

#### `POST /api/transfers/authorize`
- **Classification**: Tier 3 (`CACHETTE_ROADMAP.md` §9, §14)
- **Purpose**: Enables moving or copying files between two nodes owned by the same user. Central verifies both nodes are online and issues short-lived scoped tokens to both parties.
- **Core Principle**: Central **never** handles file bytes. Destination node connects directly to Source node's Cloudflare Tunnel URL.

#### Request Body
```json
{
  "source_node_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "destination_node_id": "1c2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a",
  "file_id": "4d76f0c1-3482-4217-a068-185e786b3cc7",
  "action": "copy"
}
```

#### Response (`200 OK`)
```json
{
  "transfer_id": "txn_6a7b8c9d0e",
  "source_url": "https://source-node.cachette.cloud/api/internal/transfer/tkn_src_8832/file/4d76f0c1-3482-4217-a068-185e786b3cc7",
  "token": "tkn_src_8832",
  "token_expires_in_seconds": 300
}
```

---

## 8. Node-Side Ingress Endpoint Reference

In addition to calling Central, nodes must expose an internal endpoint accessible to other authorized nodes through Cloudflare Tunnels:

### `GET /api/internal/transfer/{token}/file/{file_id}`
- **Classification**: Tier 3 (`CACHETTE_ROADMAP.md` §14)
- **Purpose**: Serves file bytes directly to another authorized peer node during cross-node copy/paste or backup sync.
- **Security**: The `{token}` is a single-use, short-lived (e.g. 5-minute) secret issued by Central. The node verifies the token before streaming the file from local MinIO.
- **Headers Returned**:
  ```http
  Content-Type: application/octet-stream
  Content-Length: 104857600
  Content-Disposition: attachment; filename="transferred_file.iso"
  X-File-SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  ```

---

## 9. Failure Modes & Offline Handling

Distributed architectures must expect network partitions and sleeping machines:

| Scenario | Impact on Node | Central Behavior / Fallback |
| :--- | :--- | :--- |
| **Central is unreachable** | Node can continue serving local LAN requests and local dashboard (`http://localhost:3000`). Pings to Central retry with exponential backoff. | External sharing links (`cachette.cloud/s/<token>`) return HTTP 503 or cached degraded status. |
| **Node host asleep / offline** | Node stops emitting heartbeats. | Central's heartbeat tracker marks node `offline` after $2 \times \text{heartbeat\_interval}$ (e.g. 120s). Share links display a friendly "Host laptop is asleep" UI rather than indefinite browser timeouts. |
| **Cloudflare Tunnel drops** | Local node functions normally. Heartbeat flags `tunnel_status: "disconnected"`. | Central notifies owner dashboard to restart the `cloudflared` container or check host internet connection. |

---

## 10. Contributor Implementation Checklist

When adding Central-integration features to the `cachette-node` repository, contributors should follow these conventions:

- [ ] **Config Decoupling**: Ensure all Central URLs and endpoints are read from environment variables (`CENTRAL_API_BASE_URL`, `NODE_ID`, `NODE_TOKEN`). Never hardcode `https://cachette.cloud`.
- [ ] **Async HTTP Client**: Use `httpx.AsyncClient` with sensible connection timeouts (e.g., 5.0s connect, 10.0s read) for all calls to Central.
- [ ] **Zero File Bytes**: Never route multipart upload parts, S3 keys, or raw file buffers through a Central API endpoint.
- [ ] **Idempotent Heartbeats**: Heartbeats must be lightweight, safe to retry, and never trigger heavy database transactions on failure.
- [ ] **Graceful Degradation**: If Central communication fails, the node must continue to function on localhost with zero crashes.
