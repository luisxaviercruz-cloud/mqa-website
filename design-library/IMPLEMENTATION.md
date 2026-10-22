# MQA+ Website Builder — Implementation Plan

Status: development only. Existing public pages and deployment are out of scope for changes.

## Release 1: independent new-page builder

1. **Template chooser:** Café y Coraje, QTBIPOC, Friendsgiving, Events, Vibe & Thrive, General MQA+.
2. **New-page document:** immutable generated page ID, slug, template ID, title, ordered component instances, palette key, draft status, and version.
3. **Component chooser:** hero, text/content, cards, gallery, call-to-action, registration, fundraising, and placeholders. Every instance owns its own content; source pages remain read-only.
4. **Editor controls:** text and image references, section order, approved variants and palette selections, visibility and responsive preview.
5. **Publishing workflow:** draft → review → approved → published; audit entries for edits and approvals; role-based access aligned with My MQA+ Portal.
6. **Preview and safety:** isolated preview; no user-authored script, HTML, CSS, or executable embed code; integration blocks are approved presets only.

## Initial schema (new pages only)

```json
{
  "id": "generated-immutable-id",
  "slug": "new-page",
  "templateId": "general",
  "palette": "core",
  "status": "draft",
  "version": 1,
  "sections": [
    {
      "id": "generated-section-id",
      "type": "hero",
      "variant": "general-hero",
      "props": {"heading": "Page title", "body": "", "imageAssetId": null}
    }
  ]
}
```

## Build order and gates

- **Gate A — inventory:** verify each source selector, script dependency, images, CSS specificity and responsive behavior.
- **Gate B — data model:** JSON schema, validation, unique IDs, safe assets and version history.
- **Gate C — editor:** template picker, component inspector, reorder, duplicate, undo and previews.
- **Gate D — portal integration:** authenticated access, granular permissions, storage, review and audit.
- **Gate E — publication:** staging-only output, link and accessibility checks, explicit approval before any live change.

**Non-negotiable:** never overwrite an existing HTML page or change its content, styling or JavaScript as part of this work. Never merge this branch into main without explicit approval.
