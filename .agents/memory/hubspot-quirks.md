---
name: HubSpot integration quirks
description: Non-obvious HubSpot CRM constraints and debugging notes for this repo's lead/PDF sync
---

# HubSpot quirks (Verusen MRO calculator)

## `function` contact property is a strict enumeration
The HubSpot contact property `function` (sent as `jobFunction` from the app) only accepts these
exact values: `Procurement, Innovation, IT / IS, Finance, Sourcing, Maintenance, Manufacturing,
Supply Chain, Operations, Other`. Any other value (e.g. "Engineering") makes the contact
create/update fail with a 400 `INVALID_OPTION`, which cascades to "no contactId" and therefore
no PDF upload.

**Why:** the upsert fallback prop-levels in `server/hubspot.ts` all include `function`, so an
invalid value fails every retry. The real frontend dropdown only offers valid options, so this
only bites synthetic/test payloads.
**How to apply:** when smoke-testing `/api/leads`, use one of the allowed values above for
`jobFunction`, or the whole sync silently returns `success:false`.

## Private-app token verification
- The OAuth token-introspection endpoint `/oauth/v1/access-tokens/{token}` returns 400
  ("must have correct format") for **private-app** (`pat-...`) tokens — that's expected, not a
  failure. Verify scopes by actually exercising the APIs instead.
- The `files` scope (needed for PDF upload) is confirmed working by a successful `POST
  /files/v3/files` (201) followed by a note create with `hs_attachment_ids`.

## Debugging the sync: captured workflow logs don't show per-request console output
The `/tmp/logs/*Start_application*` capture only shows boot lines, not the runtime
`console.log/console.error` from request handlers. To see the real sync error, run the actual
module directly, e.g. a throwaway `.mts` at repo root importing `./server/hubspot.ts` and calling
`syncLeadToHubSpot(...)` via `npx tsx`. The HubSpot SDK throws with the full validation body.
