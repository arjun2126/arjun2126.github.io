# Local repository preparation record

**Date:** 2 November 2026

## Scope and history

ArjunOS was identified from `AGENTS.md`, `PLANS.md`, the application, package
metadata and project documentation. The target repository was cloned separately;
the remote's README commit `84ef0fa39e98e4564d08a3081b6a647d784096a2` is preserved
as the parent of the preparation work. Branch: `chore/github-preparation`.

Only an explicit application/configuration allowlist, public assets, source
documentation and 11 referenced evidence captures were copied. No entire-workspace
copy was used. The original workspace remains unchanged; approved profile,
career, project registry, empty generated-content seed and 42 public raster
assets were verified byte-for-byte against it.

The owner authorized local corrections, tests and one local commit only. There
has been no push, main merge, deployment workflow, Pages activation or publication.
Use `git log -1` for the local commit identity and `FIRST_COMMIT_FILES.txt` for the
complete committed-path manifest. GitHub noreply commit email avoids exposing a
private email in new commit metadata.

## Privacy and staging

`git check-ignore -v --stdin` verified 27 representative paths covering:

- `.cloud-attachments/` conversation data and `.freebuff/` source downloads;
- root `content-studio/` drafts/history and unreviewed `public/content-studio/` uploads;
- `.env`, `.env.local`, `.env.production`, `.npmrc`, private key/certificate files;
- `node_modules/`, `dist/`, coverage, Playwright traces/reports and TypeScript build info;
- Vite/npm/general caches, local backups and operating-system metadata.

The actual index path list was inspected, not merely a hypothetical ignore list.
`python3 scripts/audit-staged.py` scans staged blobs for recognized token/key,
credential-assignment, private email and local-home-path patterns, checks forbidden
artifact paths, and requires the generated Content Studio seed to remain empty.
`git diff --cached --check` checks patch whitespace. The manifest is checked against
the exact staged path list before committing.

OCR reviewed all **53 candidate raster images** (42 public images and 11 selected
documentation captures). Only two Northgate contact-image variants matched an
email pattern: the visibly fictional `.test` example. Nova Grants retains its
already-cropped WebP derivatives, not the original email-bar captures; Care
Operations retains its genuine synthetic-data captures. Public imagery and
approved career facts were preserved. No portrait or résumé PDF was invented.

Pattern scans and OCR are limited detection aids, not exhaustive guarantees.
Every future upload or Content Studio generated-content change needs renewed
privacy approval; being Git-ignored does not stop a file from entering a local build.

## Security corrections

- Dev/preview bind to `127.0.0.1` by default; public-host UI authoring is disabled.
- The dev-only API validates the actual socket peer as loopback, validates a strict
  loopback Host against the listening port, and requires an exact same-origin HTTP
  Origin for writes. Missing/null/malformed/cross-origin write Origins are denied.
- Forwarded headers cannot spoof the peer. State reads have the same peer/Host
  checks and reject a supplied cross-origin Origin.
- Nested draft fields are validated before writes; invalid nested objects/arrays
  return 400, while invalid professional content returns 422. Rejected inputs leave
  saved state and history unchanged. Writes resolve under the Vite project root.
- Raw screenshot research downloads now go to ignored source storage, not directly
  into the public directory. Only reviewed derivatives belong in the application.

## Verified checks

| Command/check | Result |
| --- | --- |
| `npm ci` | Pass; lockfile unchanged |
| `npm run check` | Pass |
| `npm test` | 78 passed across 7 files, including local-access and real API tests |
| `npm run build` (also run by browser script) | Pass; 20 prerendered route documents, plus identical `404/index.html` copy |
| Static verifier in build | 19 public routes, canonical URLs, local references/assets, sitemap, robots, `.nojekyll`, custom 404 |
| `CI=1 npm run test:e2e -- --retries=0` | 30 Chromium journeys pass; no retries |
| `CI=1 npx playwright test --grep 'dragging a title bar' --repeat-each=30 --retries=0` | 30/30 pass |
| `npm audit --json` | Zero known vulnerabilities |
| Local directory-index server probe | 19 route URLs return 200; unknown URL returns real 404 with custom page |
| No-JavaScript résumé | Approved professional experience and certifications present |
| Fresh visual review | 1600 × 1000 desktop and 390 × 844 mobile; no horizontal overflow or page errors |
| Staged text/paths and candidate image review | No recognized secrets/private emails or forbidden artifacts; fictional demo email documented |

The drag test previously measured visual geometry during the 360 ms transformed
arrival animation. The audit run failed twice before a retry passed; a separate
unmodified 10-run batch did not reproduce it. The corrected test explicitly waits
for animations before measuring and polls final geometry, retaining the original
70 px horizontal/40 px vertical drag and strict `< 8` error assertions. No retry,
tolerance, movement or accessibility check was weakened.

Independent read-only review found no blocking issue in the loopback boundary.
Its observations prompted complete nested validation, a matching static résumé,
and this evidence/manifest documentation; validation was rerun after code fixes.

## Remaining gates

- Owner review and separate explicit authorization for any first push.
- Check existing remote Pages settings before any future push; no settings were
  changed here. Review only the preparation branch first, without merging `main`.
- Pages host behavior is verified locally, not on a live deployment. See
  `GITHUB_PAGES.md` for a future manual-only, reviewer-gated deployment plan.
- Chromium coverage only; Firefox/WebKit and Lighthouse remain unmeasured.
- Genuine portrait, genuine Vantage captures and an approved web-safe résumé PDF
  remain owner inputs. Current placeholders and no-email policy remain intact.

Recommendation: after owner approval, push **only the preparation branch** for
review. Do not push/merge main, force-push, enable Pages or deploy as part of that
first branch push. This record does not authorize any network write.
