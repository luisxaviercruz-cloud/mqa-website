# MQA+ Orali Security Worker — staged foundation

**Not deployed; not connected to live Digital Workplace or Orali.** This code is an isolated starter for review and later transfer to a **private** security repository. Since the current repository is public, do not commit secrets, confidential event data, tenant identifiers or production incident details.

## What this starter does
- Accepts only limited JSON event summaries at `POST /internal/events`.
- Requires a timestamp and HMAC-SHA256 signature over `timestamp + "." + raw_request_body`.
- Rejects requests outside a five-minute time window and malformed event data.
- Deduplicates events by unique event ID through the D1 primary key.
- Provides a non-sensitive `GET /health` endpoint.
- Does not perform AI analysis, automatic response, portal authentication, device actions or cloud deployment.

## Critical security requirements BEFORE use
1. Set up a **private GitHub security repository** and separate Cloudflare Worker/service identity with the fewest required permissions.
2. Restrict `/internal/events` with Cloudflare Access / private service routing (HMAC alone is not sufficient for production).
3. Ensure Microsoft/GitHub/Cloudflare provider events are independently verified by trusted adapters before re-signing through the internal gateway.
4. Use Wrangler secret storage for `INTAKE_HMAC_KEY`; configure D1 binding `SECURITY_EVENTS`; never put secrets in source.
5. Provision D1 with `schema.sql` and encrypted independent backups; implement retention, monitoring, and alerting.
6. Security review: payload raw byte sizes (streaming limit), timestamp validation, key rotation, high-volume DoS protection, IP/rate limiting, schema abuse tests, audit logging and data minimization.
7. Add signed integration tests and a protected staging deployment before any production exposure.
8. Identity-protected **read-only** incident listing must be built using existing portal auth after confirming actual production Worker source. Do not mount an open incidents endpoint here.
9. Orali must remain a restricted, read-only summarizer until human-approved action gateway and rollback tests are in place.

### Example signed event shape (synthetic)
```json
{"event_id":"test_12345678","source":"test","type":"suspicious_login","severity":"medium","observed_at":"2026-10-28T00:00:00Z","summary":"Synthetic suspicious login test"}
```

This starter is **not a complete cybersecurity system**. It is an implementation beginning for isolated, auditable event collection.
