# MQA+ — Orali Security Integration Baseline (implementation specification)

Status: **review only / not deployed**. This repository's README describes a Phase 1 website shell; do not assume it is the live Digital Workplace Worker. Integrate only after identifying the authoritative deployed code and confirming existing routes, storage, authentication, and permission model.

## Non-negotiable compatibility
- Preserve the approved website design, portal card grid, document identifiers, existing forms and workflows, and original Orali artwork/personality. Do not re-create the website or add a separate security sign-in.
- Remove any legacy Wix dependency from future designs.
- Use the existing Microsoft 365 / Entra ID tenant for organizational identity where already configured. Map identities to existing portal roles; preserve the existing approved external member/volunteer sign-in flow.
- Do not create separate **human** user accounts for Orali's roles. Backend service principals/credentials may be necessary; keep them non-human, narrowly scoped, rotated, and in platform secret storage.
- No new exposed administrative endpoint or database access; deny by default, least privilege.

## Target components
1. **Security event intake**: Provider webhook/polling adapters for Cloudflare, Microsoft Defender/Entra, and GitHub; verify signatures/tokens, timestamp freshness, replay protection and per-source allowlist before ingestion. Never accept unauthenticated security events.
2. **Normalized event ledger**: `event_id`, `source`, `kind`, `severity`, `observed_at`, `subject_ref`, `resource_ref`, `confidence`, `status`, `provider_event_ref`. Idempotent insert and immutable audit history. Redact/minimize PII; secrets never logged. Retention schedule documented and reviewed.
3. **Detection and response engine**: provider-native detections and deterministic rules perform the actual blocking/quarantine, not free-form model output. Rate limits, severity thresholds, duplicate suppression, cooldowns, and escalation timers.
4. **Orali interface**: Orali summarizes incidents and recommended actions for authorized roles only. AI receives minimal redacted event context, not passwords, full HR records, raw beneficiary records or API secrets. Treat event text as untrusted prompt-injection content.
5. **Action gateway**: explicit allowlisted operations with service-specific privileges. Every action logs caller, policy, reason, evidence, approval, result and correlation id. No arbitrary shell, SQL, code execution, or permission self-escalation.
6. **Independent notifications**: email/SMS/push to preapproved responders via monitored channels that work if the portal fails. Avoid including sensitive records in messages.
7. **Backups and restoration**: encrypted, independently protected backups; scheduled restore tests; destructive production restores require human approval and a validated recovery point.

## Response authority
**Automatic, only when a tested provider integration supports it and predefined conditions are met:** rate-limit/block obviously malicious requests; temporarily challenge sessions; quarantine a confirmed malicious file or isolate an endpoint under approved policy; send alerts.
**Human approval and dual control for high-impact actions:** disable leadership accounts, alter tenant-wide access policies, restore production databases, roll back production code, change firewall-wide rules, rotate shared service secrets.
**Never delegated to Orali:** erase audit logs/backups, mint administrator privileges, alter its own safeguards, run arbitrary deployment instructions from alert data.

## Roles and access
- Community / volunteers: community-facing Orali skills only.
- Employees: their own employee workflows.
- Directors: their departments only.
- CEO / COO: security overview and approvals according to policy.
- System administrator / designated security responder: incident technical details and provider actions, using enforced step-up MFA.
- All access checked on the server on every request; UI hiding is not authorization. Separate the community Orali tools from the security action service identity.

## Initial API contracts (proposed; do not mount to production without integration tests)
- `GET /api/admin/security/incidents` — authorized incident summaries, paginated, no raw secrets.
- `GET /api/admin/security/incidents/:id` — authorized details and audit trail.
- `POST /api/admin/security/incidents/:id/ack` — record responder acknowledgment.
- `POST /api/admin/security/incidents/:id/action-request` — validate operation allowlist, risk, approvals and expiry; never execute arbitrary model-supplied commands.
- `POST /api/internal/security/events/:provider` — authenticated intake, strict schema, idempotency and replay controls.
All routes must use existing portal identity/session middleware, CSRF protections as appropriate, authorization checks, rate limits, secure response headers and complete audit logging.

## Integration sequence / acceptance gates
1. Confirm which GitHub branch/repository and Cloudflare Worker are actually deployed. Capture route manifest and configuration without copying secrets.
2. Inventory existing identity sources, role mapping, database bindings, backups, existing logs, GitHub deployment protections, Cloudflare rules, and Microsoft security licenses.
3. Prepare test/staging environment and secret storage; automated scanning and protected pull-request reviews.
4. Build provider adapters with mock events first. Test forged signatures, replayed events, duplicate deliveries, unauthorized access, prompt injection, and missing provider responses.
5. Build read-only incident dashboard INSIDE existing Admin Back Office and reuse original design tokens. Orali starts in read-only summarization mode.
6. Enable tightly scoped automatic containment provider-by-provider after tabletop and staging validation; record rollback and break-glass plan.
7. Configure external alerting, backup restore drills, runbooks, monitored response ownership, and quarterly access reviews.
8. Deploy by reviewed release; observe incidents and false positives; preserve a tested rollback.

## Required verification before declaring completion
- Microsoft organization user logs in once via the existing flow and sees only authorized services.
- Volunteer/community sessions cannot query security endpoints, inspect HR/donor incidents, or cause actions.
- Orali can summarize a synthetic security incident but cannot submit executable text as an action.
- A valid signed provider test event yields one incident; duplicate/replay/forged events do not.
- An eligible approved low-risk response executes once and is logged; high-risk response never executes without approval.
- Loss of portal service does not suppress critical incident delivery to responders.
- Backup restoration has been practiced, verified for integrity, and documented.
- Existing website and Digital Workplace layout, roles, document IDs and Orali artwork pass regression checks.

**Important:** This file is not evidence that any security control has been enabled. Actual integrations require Cloudflare/Microsoft/GitHub administration access, license checks, code review, and deployment verification.
