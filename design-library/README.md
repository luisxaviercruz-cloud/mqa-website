# MQA+ Design Library — isolated development

This directory is the first implementation artifact for the new-page editor. It does **not** replace or rewrite any existing website page, CSS, JavaScript, assets, or live deployment.

## Source of truth
- `design-registry.json` maps six approved page-design families to existing source files.
- It inventories initial reusable component selectors and approved **sampled** palettes. These are not yet a complete token extraction.
- Existing pages are **references only**; new pages must be separate instances with unique paths and independent content.
- The General template references About, Home, Programs, Resources and Partners; its final composition requires visual verification.

## Next implementation gates
1. Verify actual CSS selector definitions, interaction dependencies, image paths and responsive states.
2. Build read-only screenshot previews of each approved source page at desktop/tablet/mobile widths.
3. Build editor-only structured content schema and isolated template renderer (no publishing).
4. Validate each preview against the approved page before enabling new-page authoring.
5. Add draft/approval/publishing integration only after security and deployment review.

## Protected areas
Never expose source scripts, shared header logic, integrations, secrets, or arbitrary HTML/CSS editing in the content editor. Do not merge this branch into main or deploy without explicit approval.
