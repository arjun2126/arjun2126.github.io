# Persistent progress

## Publication resumed after authentication — 12 November 2026

Owner confirmed local GitHub reauthentication and renewed the existing publication authorization. Authentication now succeeds as `arjun2126`. Fresh fetch confirms the release HEAD and latest `origin/main` both equal `05f8874babe313825fa5cd4bfcc75c5597b3b568`; no merge or history rewrite is needed. All reviewed staged release files remain unchanged; only this progress log has an additional operational note. All four candidate/public/dist SHA-256 values still match the approved plan, and all original PDFs retain their hashes and Git-ignore protection.

Independent final review accepted all 17 release paths, exact assets/privacy and all 16 decoded desktop/mobile card/viewer screenshots. Fresh pre-publication rerun passes 129 unit/API tests, all 44 browser tests with zero retries/failures, production build/type/static/publication checks and résumé download coverage. Dependency audit again reports zero vulnerabilities. No production source or approval policy changed after acceptance. Proceed through the authorized commit, PR and CI gates before squash merge and Pages/live verification.

## Publication authentication hold — 12 November 2026

Final unchanged staged/history security audit passes for 17 paths. Four approved candidate/public/dist SHA-256 comparisons pass; all four original PDF hashes remain unchanged and each original is Git-ignored. No original PDF was copied into release assets. All local release gates recorded below pass; independent final review is in progress.

Stopped before commit/push: `gh repo view` returns HTTP 401 and `gh auth status` confirms the active `arjun2126` GitHub token is invalid. Owner must reauthenticate locally with `gh auth login -h github.com`; never paste credentials into chat. No PR, merge or deployment has been attempted, and no history rewrite or gate bypass occurred.

## Final accessibility remediation authorized and verified — 12 November 2026

Owner explicitly approved the gallery preview accessible-name correction, regression/selectors, exact mobile copy assertion and Studio replacement-test synchronization. Added `Enlarge: ` to the existing preview accessible name only; no visible text, CSS, artwork, navigation or behavior changed. Studio regression now waits for the distinct processed JPEG replacement and its 90 × 60 fixture dimensions, verifies publication is disabled and old redaction claims cleared, then enters fresh labels after redaction. An initial test expectation incorrectly assumed PNG output; corrected it to the existing JPEG conversion rather than changing product behavior.

Final local gates: type checks pass; 129 unit/API tests pass; production build, résumé generation, static routes and 68-file publication validation pass; all 44 browser tests pass with retries disabled and zero failures. Coverage includes both scrolled homepage viewports, each gallery button's visible/accessibility name, desktop/mobile all-four viewers, Studio replacement privacy and desktop/mobile résumé PDF download. The separate disposable Studio workflow integration also passes, preserving original approved content/approvals. Dependency audit reports zero vulnerabilities. Desktop/mobile card and viewer screenshots captured after image decode for final visual review. Security/integrity audit and independent final review are required before commit/push.

## Release stopped at new gallery accessibility gate — 12 November 2026

Type checks, all 129 unit/API tests, production build/static/publication validation and the unchanged staged/history security audit pass. Browser verification with retries disabled reports 40 passed and 3 failed out of 43. Both scrolled homepage accessibility regressions pass at 1440 × 900 and 1600 × 1000, as does desktop coverage opening all four approved previews.

New product blocker: public image preview buttons visibly say “Enlarge” but their accessible names say “Open NAME certificate viewer”; axe reports serious `label-content-name-mismatch`. Independent follow-up review confirms this blocker supersedes its earlier conditional complete-diff approval. The smallest proposed nonvisual correction is prefixing the existing accessible label with `Enlarge: `, updating exact-name selectors and adding a gallery regression. Additional owner approval is required before that correction; no rule suppression or visual change is proposed.

The other two browser failures are independently confirmed test issues: the mobile privacy-copy regex expects uppercase “Credential” while the updated notice uses lowercase; the Studio replacement test waits for an already-present seed image and sets redaction claims before asynchronous upload intentionally clears them. Proposed synchronization must wait for the new image/private replacement state, confirm old claims were cleared, then enter fresh labels, preserving the safety behavior.

Independent asset/privacy review remains accepted: all four candidate/public bytes, metadata, artwork and original PDF integrity checks match. Full release approval remains blocked pending authorization and a passing rerun, including mobile viewers. No commit, push, PR, merge or deployment occurred. Original PDFs remain private and unchanged; no failed gate was bypassed.

## Approved image release and nonvisual accessibility correction — 12 November 2026

The owner explicitly approved removing only the redundant homepage credential-link `aria-label`, preserving its visible text, styles and navigation, and adding a scrolled/settled accessibility regression. That approval resolves the historical scope hold below; no visual redesign is authorized.

Prepared the exact four approved WebPs in a separate release clone on `release/approved-certificate-previews` from main `05f8874`. Bytes and filenames follow the private publication plan; only the four public image records gain image sources/alt/redaction labels and document visibility. Original PDF files and the owner's private authoring state are not copied or changed. Dates and verification fields remain empty; image artwork/titles are not rewritten. Updated names-only descriptions solely to accurately describe the now-approved sanitized previews, without layout/style changes. Used the existing explicit exact-file approval workflow for the generated file and four asset hashes. Full check results and independent review must pass before commit/push/PR/squash merge/Pages deployment.

## Approved certificate image release preflight — 12 November 2026

Owner approved the exact four sanitized WebPs and mappings from the private `publication-plan.json`, with no gallery redesign or unrelated changes. Created an isolated clone and local branch `release/approved-certificate-previews` from current main `05f8874babe313825fa5cd4bfcc75c5597b3b568`. All four candidate SHA-256 values match the approved plan; all original PDF hashes match their pre-task manifest. No original or review artifact was transferred, no public image was copied, and no certificate record, publication flag or approval hash changed.

**Stopped before implementation/publication:** the previously reported live homepage accessibility gate still fails at 1600 × 1000 with credentials scrolled into view after fonts/animations settle. Axe reports serious `label-content-name-mismatch` on all four `.os-credential` links. Independent read-only source/test review confirms the pre-existing redundant `aria-label` in `src/components/os/HomeView.tsx:99` conflicts with the visible issuer/status label. Existing baseline accessibility coverage does not specifically scroll and audit this section.

Minimal proposed remediation is nonvisual: remove the redundant label so link names derive from existing contents, add a settled/scrolled viewport regression, and rerun all release gates. This was not silently included in the asset-only approval; request owner approval before proceeding. No new commit, push, PR, merge, deployment, history rewrite or gate bypass occurred. The full new release suite was not claimed green; preflight failed first. Original authoring worktree and private review host are untouched.

## Authorized clean names-only release — 10 November 2026

The owner explicitly approved a separate clean clone and new release branch from latest `origin/main`, transferring only the reviewed gallery and security/copy corrections as new commits. Existing worktrees, refs and commits remain untouched; no force-push or audit-policy exception is authorized. This approval supersedes the historical hold below only for the clean release after every gate and independent review passes.

Clean branch: `release/certifications-gallery-clean`; baseline: `48e2e61c6e417f55afc078dc181283f22856fc0d`. Only aggregate file changes were transferred; the unpublished candidate commit and its problematic fixtures are absent from this clone. Original private PDFs and authoring recovery changes were not copied. Names, Salesforce issuer and existing portfolio integrations are the public scope; document flags remain disabled and document paths, dates and verification URLs empty.

Clean-clone preflight: unchanged staged/history audit passes (11 existing commits, 269 historical blobs, 50 changed paths); TypeScript, 125 unit/API tests, production build/static/publication gates and 41 desktop/mobile browser journeys pass with no retries. Browser checks use an isolated session-only preview configuration, never the owner's existing server. Isolated Studio upload/save/reload/restart/build/private-asset checks pass. Fingerprint comparison of 208 index files, 102 production files and 269 historical blobs with all four original PDFs, extracted identifier candidates and embedded document links finds no sensitive matches. All 63 existing public assets and non-certification saved content are byte-identical to remote main. The production résumé remains a two-page downloadable PDF.

Independent complete-diff review accepts the code and names-only scope. Its evidence correction was addressed by regenerating and visually inspecting desktop/mobile gallery and homepage captures against this clone's build; final independent re-review accepts the complete code, scope and evidence with no remaining review blocker and independently reruns the unchanged history audit successfully. Deployment remains conditional on unchanged post-commit audits, passing PR checks, reviewed changed-file scope and a squash merge through the existing Pages workflow.

## Blocker remediation — 10 November 2026

Working-tree fixes replace the two synthetic audit fixtures while retaining rejection coverage, restore Vite's default filesystem protections plus project restrictions, and make gallery/mobile/desktop/metadata wording strictly names-only. New real-config filesystem tests cover protected resources, legitimate authoring and exact private PDF persistence across restart. The original owner clone and private documents remain untouched. Final verification: TypeScript, 125 unit/API tests, production build, 41 browser journeys with no retries on an isolated preview, and the isolated Studio upload/save/reload/restart/build/privacy workflow pass. Production résumé GET returns HTTP 200, application/pdf and a valid PDF header. Desktop/mobile captures inspected. Independent final review accepts the complete code remediation with no remaining code blockers.

The unchanged staged-file audit passes for all 14 remediation paths. The same audit with history enabled still reports exactly the two original synthetic findings in `91bb13e`; no suppression was added. Fingerprint scanning of 206 tracked files, two new remediation files, 102 production files and 317 historical blobs found no original private PDF payload, extracted credential identifier, private filename or private document verification link. All four public records remain names/issuer only, and existing public assets are unchanged. Fixes are staged in the release worktree only; no new commit, push, merge or deployment occurred. Awaiting owner approval for the clean-branch/clone approach documented below.

History inspection identifies exactly one unpublished commit, `91bb13e`, with two synthetic negative-test literals and no genuine secret in those findings. **No publication may proceed without explicit approval for a clean new release branch/clone that excludes that inherited fixture history.** A descendant fix cannot pass the unchanged all-history audit. Existing local/remote branches, history and audit rules have not been rewritten or bypassed. Scope and exact original locations: `docs/CERTIFICATIONS_REMEDIATION.md`.

## Names-only publication gate — 10 November 2026

Owner authorized only the four certification names and Salesforce issuer, preserving integrations and keeping documents/identifiers/dates/verification claims unpublished. A clean release worktree excludes uncommitted authoring-recovery changes and owner uploads. TypeScript, 110 unit/API tests, production build and all 41 browser tests passed without retries, including production résumé PDF download. Fingerprint scanning of 206 tracked files and 102 production files found no original certificate payloads, extracted credential identifiers, private filenames or embedded document links; existing public assets are unchanged.

**Publication stopped before any push, merge or deployment.** The unchanged security audit flags synthetic credential-bearing URLs in certification tests and their unpublished history. Independent review also found that the custom Vite filesystem deny list drops default protections, plus wording that overstates verification/source availability. These findings require remediation and fresh review; no gate was weakened. Candidate: `91bb13e2aa1f746ac68c79467fa2d222ea97e12d`. No new publication commit was created.

## Active launch milestone — 3 November 2026

The owner's new launch authorization supersedes historical no-push/no-deployment gates below.
Verified clean preparation branch at f80483b; origin/main remained 84ef0fa after fetch.
Repository is public; authenticated GitHub account matches the owner. Pages was already legacy
branch publishing. All work is confined to the separate preparation clone.

Launch implementation: local portrait/gallery/PDF persistence; project titles/links; hosted-video
integration; reviewed-hash publication gate; Node 22 Actions PR checks and main-only deployment.
Existing public assets and curated professional facts remain unchanged; generated seed is empty.
TypeScript, 78 baseline unit/API tests and 30 browser journeys passed. Isolated real-browser
image upload/save/refresh/restart/build/static-assets roundtrip passed without changing originals.
Independent review identified quota handling, partial media overwrites and cross-view content
consistency issues; these were corrected. Re-review approved initial publication with no blocker:
all 46 public files byte-identical, empty seed, TypeScript/static/privacy checks passing.
Latest unit/API suite: 87 passing tests across 8 files. Latest browser suite: 30/30, no retries.
The isolated workflow also passed a 5.9 MB synthetic PDF upload/save/restart/build/download test.
All fixture data was removed, and the approved seed/manifest remained unchanged.
Initial publication is complete: PR #1 merged after CI passed; main deployment run 41675516523
succeeded at commit `12524d6fb8ca463e3e10e9d78839450ff4fc5d8d`. Direct HTTPS verification passed
20 desktop/mobile routes, 46 asset hashes, canonicals/sitemap, custom 404, absent private APIs,
and settled-state accessibility checks. Eight public repository links and five Northgate routes
returned 200. No Salesforce framing settings changed. Evidence: LAUNCH_REPORT.md.
Reviewed follow-up synchronizes résumé capabilities/current title and fixes Reset draft's stale
module-level preview. Local full harness passed again; this follow-up must pass its own PR gate.
Current owner workflow: CONTENT_UPDATES.md. Historical limitations/gates below describe prior work.

## Current state

ArjunOS is a reference-driven macOS-style portfolio with approved professional content, a working local Content Studio, a licensed photographic wallpaper, a verified Northgate live-site fallback, and 20 static route documents. The desktop composes three windows, a Dock and a translucent menu bar; Recruiter Mode also has a standalone URL. The final 2 November polish pass is complete and validated; the genuine portrait remains the only missing input in the homepage hero.

## Completed

- **Approved content import (2 Nov 2026)** — two professional roles, Durham College and MS Ramaiah education, four Salesforce certification names, Whitby location, availability, LinkedIn and AI non-claims. Phone, address, work authorization, compensation, credential IDs, application records and the unconfirmed Matchpoint role remain excluded.
- **Recruiter Mode** — five sections: Overview, Experience, Skills, Projects and Credentials; current/prior roles, location, certifications, education and verified links.
- **Experience and résumé** — professional employment plus independent work kept separate; roles, responsibilities, education, certifications and no total-years figure. Contact remains LinkedIn/GitHub only.
- **AI Engineering** — approved positioning, Agentforce prototype labelled experimental, and explicit “what I have not done” non-claims.
- **About, contact, mobile and sidebar** — aligned with the approved profile; LinkedIn replaces the placeholder quick link.
- **Visual foundation** — photographic public-domain alpine wallpaper, violet grading, dark glass, traffic lights, menu bar, Dock and system-like typography.
- **Content Studio** — profile/photo, career, skills, projects and media editing; DOCX/Markdown/TXT/JSON import; client-side image resizing; validation; preview; save-to-project; JSON export.
- **Local save pipeline** — a dev-only Vite endpoint writes generated content, optimized WebP assets, current draft and up to 20 reversible history files. Invalid drafts return 422.
- **Northgate Live (2 Nov 2026)** — verified the published buyer URL at `/owners/s/buyer`; a direct Chromium probe confirmed `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'` block embedding. Added `/northgate-live/` with genuine captures, loading state, framing disclosure, full-screen preview, live external links, inventory and 3D Studio access. Owner Portal is excluded. No Salesforce setting was changed; the existing case study gains a callout and remains intact.
- **Quality** — 38 unit tests, 29 Chromium journeys, axe scans, reduced-motion and no-JavaScript checks, mobile overflow checks, and desktop/mobile captures.
- **Final UI/UX polish (2 Nov 2026)** — replaced “Welcome to ArjunOS” with “Hi, I’m Arjun Subramanya.”; added the verified professional subtitle; strengthened hierarchy, contrast and links in the four skill cards; moved featured work to a larger two-column grid; increased desktop margins, window separation and content spacing; surfaced standalone recruiter actions and selected work above the tabs; wrapped and tightened the mobile recruiter layout. No professional claims or privacy controls were changed.
- **Final visual evidence** — `polish-desktop-1600.png`, `polish-desktop-1440.png`, `polish-tablet-768.png`, `polish-mobile-390.png`, `polish-recruiter-1600.png`, `polish-recruiter-390.png`, `polish-salesforce-1600.png`, `polish-northgate-live-1600.png`, `polish-northgate-live-390.png`, and `polish-before-after-1600.png`.

## Validation log

| Date | Check | Result |
| --- | --- | --- |
| 2 Nov 2026 | `npm run check` | Pass |
| 2 Nov 2026 | `npm test` | 38 passed |
| 2 Nov 2026 | `npm run build` | Pass; 20 HTML routes, 8 project pages |
| 2 Nov 2026 | `npx playwright test` (baseline) | 28 passed (desktop + mobile) |
| 2 Nov 2026 | Final `npm run check` | Pass |
| 2 Nov 2026 | Final `npm test` | 38 passed |
| 2 Nov 2026 | Final `npm run build` | Pass; 20 HTML routes, 8 project pages; JS 426.51 kB (123.63 kB gzip), CSS 146.07 kB (27.85 kB gzip) |
| 2 Nov 2026 | Final `npx playwright test` | 29 passed (desktop + mobile) |
| 2 Nov 2026 | Final production captures | 1600 × 1000, 1440 × 900, 768 × 1024, 390 × 844; recruiter, Salesforce and Northgate Live; no horizontal overflow or console errors |
| 2 Nov 2026 | Final visual review | New H1 and subtitle, four linked skill cards, two-column featured grid, separated desktop windows, recruiter CTAs above tabs, wrapped mobile tabs; Northgate Live unchanged |
| 2 Nov 2026 | Northgate buyer URL + framing | `/owners/s/buyer` 200; `X-Frame-Options: SAMEORIGIN`; `frame-ancestors 'self'`; real iframe blocked by response |
| 2 Nov 2026 | Northgate Live visual + isolation | Genuine captures, loading overlay cleared, full-screen action, external links, no Owner Portal route; 1600 × 1000 and 390 × 844 captured |
| 2 Nov 2026 | axe WCAG 2 A/AA and 2.1 A/AA | No serious/critical findings: desktop home, project, résumé, recruiter; mobile home, project |
| 2 Nov 2026 | DOCX import + photo persistence | Browser test: import, review, apply, reload; passed |
| 2 Nov 2026 | Local save endpoint | 200 with portrait + media written; state/history returned; empty name returned 422 |
| 2 Nov 2026 | Mobile 390 × 844 across eleven routes | No horizontal overflow, including Northgate Live |
| 2 Nov 2026 | Visual review at 1600 × 1000 | Three-window desktop, recruiter sheet, studio, Northgate Live and case-study callout captured |

## Known constraints

- No deployment or domain purchase.
- The chat photograph was not present in the workspace or attachment store as a file. A final search on 2 November found no portrait asset; only `public/og/arjunos-cover.png` matches a profile filename. The portrait placeholder remains the upload step and no substitute was used.
- The larger two-column featured grid intentionally leaves its second row below the fold at 1600 × 1000; the main pane scrolls. The compact Recruiter window also scrolls its overview, while `/recruiter/` shows the full summary at 1600 × 1000.
- Genuine Vantage screenshots still need owner supply; the studio accepts them and applies the first as the project cover.
- Email publication is not approved; phone and address are excluded.
- The downloadable résumé PDF is generated at build time (two A4 pages) from approved content; see the 4 November 2026 entry below. PDF text import is unsupported.
- The save endpoint exists only under `npm run dev`; `vite preview` serves the built content and cannot write files.
- Content Studio is Chromium-tested; Safari and Firefox were not run.
- The initial UI delivery had no independent reviewer; repository preparation subsequently received an independent security/correctness review. Owner visual/content review remains an external gate.
- `vite preview` returns HTTP 200 for unknown paths; `404.html` needs host configuration.
- Lighthouse/Core Web Vitals were not measured.
- Repository test and metric counts are quoted from documentation, not re-executed.
- Salesforce blocks third-party framing of the buyer experience. ArjunOS shows owner-published captures and links out; it does not proxy or weaken Salesforce security. True embedding needs explicit owner approval for a Salesforce CSP/framing change and was not attempted.

## Next

Await owner authorization after the local preparation commit. Do not push, merge,
activate Pages or deploy. Owner assets and optional Salesforce framing changes
remain separately approval-gated. The approved GitHub production origin is now
configured for local build metadata, not activated hosting.

## GitHub preparation — 2 November 2026

- Cloned the existing repository and preserved the `main` README commit on
  `chore/github-preparation`; copied only the application/configuration allowlist,
  public assets, source documentation and 11 reviewed evidence captures.
- Original workspace and approved career/profile/project content remain unchanged;
  all 42 public raster assets are byte-identical to the audited source workspace.
- Ignored conversation attachments, local drafts/history, unreviewed uploads,
  environment/credential files, builds, dependencies, reports, caches and backups.
  Verified 27 representative exclusions with `git check-ignore -v`.
- Bound development/preview to loopback and gated authoring requests by actual
  socket peer, exact loopback Host/listening port and same-origin HTTP Origin.
  Added nested draft shape validation; malformed drafts cannot write files.
- Reconciled screenshot provenance/privacy documentation and static résumé,
  experience/contact copy without introducing professional claims or new imagery.
- Configured root-base GitHub metadata, `.nojekyll`, sitemap/canonical generation
  and a static-output verifier. No deployment workflow or Pages activation.
- Drag investigation: the original test sampled the transformed entrance-animation
  bounding box without synchronization. Waited for animation completion, retained
  the same 70/40 movement and 8-pixel assertions, and polled the final geometry.
  Baseline repetition passed 10/10 (the audit flake was not reproduced in that
  batch); synchronized test passed 30/30 with retries disabled.
- Latest gates: TypeScript pass; 78 unit/API tests pass; build plus 19-public-route
  static verification pass; 30 Chromium journeys pass with retries disabled;
  `npm audit` reports zero known vulnerabilities.
- Local static hosting probe: 19 direct routes return 200, unknown route returns
  custom HTML with 404 status, no-JavaScript résumé retains approved career and
  credentials. Fresh 1600 × 1000 and 390 × 844 views inspected; no overflow or
  page errors. Fresh captures stay in ignored `test-results/preparation-visual/`.
- OCR scanned 53 candidate images; only the Northgate demo `.test` address matched.
  Recognized-secret/private-email staged text scan passes. OCR/pattern scanning
  is not proof against every possible secret or private pixel.
- Independent review found no blocker in the local access boundary. Its nested
  validation and static résumé observations were addressed and tests rerun.
- Full candidate manifest and preparation record are in `FIRST_COMMIT_FILES.txt`
  and `REPOSITORY_PREPARATION.md` (relative to this document).

## Reconciliation and 4 November release preparation

- **Workspaces.** `ArjunOS-github-preparation` is the release source on branch
  `release/arjunos-2026-11` (from `323e6a2`). `Resume Website` is preserved as the donor and
  backup; it was not overwritten, and no new repository was initialised.
- **Backups.** `../ArjunOS-backups/2026-11-04/` holds `gitws-public-media/`,
  `gitws-content-studio/`, `gitws-studio.generated.json`, `src-workspace/`, checksum manifests
  and `finder-duplicates/` (171 quarantined Finder copies). Nothing was deleted or reset.
- **Media.** One owner portrait (`portrait-b51b352b14a4ac708461518a.webp`, 1127x1311) and 16
  Vantage captures (WebP derivatives of `1Vantage.jpeg`-`16Vantage.jpeg`) are referenced by the
  saved Studio draft: 17 references, 17 files, no orphans. All 16 gallery URLs returned HTTP 200.
- **Résumé PDF withheld.** The supplied PDF contains a personal phone number, a personal email
  address, Salesforce credential IDs and claims that conflict with the approved professional
  record. It is retained privately in `content-studio/private/` (gitignored); `resume.pdf` is
  empty, so no résumé download is published.
- **Copy rewrite.** Profile, professional record, expertise, project registry, About, Résumé,
  Experience, AI, Salesforce, Sidebar, mobile and metadata copy were rewritten in a
  first-person, evidence-first voice. Internal approval/handoff wording, the "Three years"
  figure and marketing phrasing were removed. Employers, titles, dates, education and
  certification names are unchanged.
- **Layout fixes.** Maximised windows now stop above the Dock
  (`height: calc(100% - 104px)`); AI and Experience window bodies scroll (`overflow-y: auto`);
  Salesforce uses container queries to move from compact to expanded typography and two-column
  content without changing the compact window.
- **Studio sync.** The generated draft and the static content files carry the same wording, so
  saved Studio overrides no longer restore the old copy.
- **Test adaptation.** `tests/unit/content.test.ts` covers the Vantage gallery, cover and
  portrait; `tests/e2e/desktop.spec.ts` gains layout regression cases;
  `scripts/test-studio-workflow.ts` now asserts baseline-relative media (existing owner media
  preserved, exactly one synthetic upload appended) instead of assuming an empty folder.

### Validation - 4 November 2026

| Check | Result |
| --- | --- |
| `npm run check` | Pass |
| `npm test` | 87 passed / 8 files |
| `npm run test:studio` | Pass - browser upload, save, restart, build and static assets |
| `npm run build` | Pass - 21 HTML routes, 8 project pages, 20 static routes verified |
| `npm run test:e2e` | 34 passed / 2 projects (desktop 1440x900, mobile 390x844) |
| Publication gate | 64 reviewed source/assets approved, including the Studio draft and all 17 owner media files |
| Accessibility | axe checks on home, project pages, résumé and recruiter: no serious or critical violations |
| Chromium geometry, 1600x1000 | Maximised window bottom 904 vs Dock top 913; 3 windows; no horizontal overflow; no console errors |
| AI route scroll | Both scrollers reached maximum (467 px); footer visible at a 1000 px viewport |
| Experience route scroll | Reached bottom; last entry fully visible |
| Salesforce workspace | 7 tabs switch without clipping; no horizontal overflow at 1600 or 900 |
| Vantage gallery | Cover alt text present; 16 gallery buttons; 16 of 16 media URLs 200 |
| Mobile 390x844 | 8 routes, zero horizontal overflow |
| WebKit | Not run - Chromium only |

### Approval recorded (4 November 2026)

The owner approved publication of the genuine portrait, all 16 Vantage captures, the public
LinkedIn and GitHub links and the rewritten copy, and explicitly withheld the résumé PDF. The
approved hashes are recorded in `publication-approved.json`. A redacted résumé PDF and a genuine
hosted walkthrough recording remain open items.

### Résumé PDF export repaired (4 November 2026)

Root cause: no PDF asset existed. `profile.resumePdf` was empty because
`src/content/studio.generated.json` held `"resume": { "pdf": "" }`, so the site rendered no
download link, every `/resume/*.pdf` URL returned 404, and the only export was `window.print()`
of the desktop window - a three-page A4 dump of a 1440 px layout, with a 423-character second
page. The Recruiter Mode "Download résumé" action navigated to `/resume/` instead of downloading.

Fix: `src/lib/resumeDocument.ts` builds a dedicated A4 document from the approved content modules,
and `scripts/resume-pdf.ts` renders it with headless Chromium during `npm run build` into
`dist/resume/arjun-subramanya-resume.pdf`. The web résumé and Recruiter Mode both link to it with a
`download` attribute; a Content Studio upload still takes precedence when one exists. The private
PDF in `content-studio/private/` is untouched and unpublished.

| Check | Result |
| --- | --- |
| `npm run check` | Pass |
| `npm test` | 91 passed / 9 files, including 4 new résumé-document tests |
| `npm run test:studio` | Pass |
| `npm run build` | Pass - PDF two A4 pages, 185 KB; 64 reviewed assets and static output verified |
| `npm run test:e2e` | 35 passed / 2 projects, including desktop and mobile PDF download assertions |
| Chromium download | `Arjun-Subramanya-Resume.pdf`, 189,516 bytes, `%PDF-` |
| WebKit download | Same file at 390x844; zero horizontal overflow |
| PDFKit text check | Both roles, both institutions, all four certifications and all eight projects present; no email, phone or credential ID; pages 596x843 pt |
| No blank pages | Page 1 2,776 characters, page 2 1,562 characters |

### Résumé PDF footer cleanup (5 November 2026)

Owner review asked that the generated résumé show only résumé content. The PDF footer now carries
just the name and the public résumé URL; the "generated <date> from the approved public résumé"
line and the "no phone number, email address or credential ID is published" sentence were removed
from the visible document. Both privacy gates stay in place and still run before a byte is
written: `scripts/resume-pdf.ts` asserts the source HTML carries no phone number, email address,
credential ID or private path, and `tests/unit/resume-document.test.ts` asserts the same while also
failing if build or privacy commentary reappears in the HTML.

Checks after the change: `npm run check` pass; `npm test` 92 passed / 9 files; `npm run test:studio`
pass; `npm run build` pass (résumé PDF 2 A4 pages, 180 KB, 64 reviewed source/assets and static
output); `npm run test:e2e` 35 passed. Extracted PDF text: 2 pages (2,755 / 1,422 characters), zero
email, phone, credential-ID or build-commentary matches.

## Milestone 9 — Certifications and credential gallery (9 November 2026)

- **Feature branch** — `feature/certifications-gallery` on top of `main`; local only. No push, merge,
  Pages activation or deployment.
- **Public section** — `/certifications/` with four responsive credential cards, issuer, neutral date
  status, verification status and document status. The four owner-approved names are unchanged.
  Dates, verification URLs and documents were not present in the approved record, so each card says
  they are not published. No credential is described as active.
- **Viewer** — enlarged image/PDF viewer with Escape close, focus trap, focus restoration and
  previous/next arrow navigation. Images are lazy-loaded; PDFs render in an iframe with a direct-open
  fallback.
- **Integration** — sidebar, Dock, File/View menus, homepage summary, Recruiter Mode overview and
  Credentials tab, mobile tab-adjacent navigation and footer link, prerendered `/certifications/`,
  canonical metadata, sitemap entry and `EducationalOccupationalCredential` JSON-LD.
- **Content Studio** — structured certification editor with add/remove/reorder, name, issuer, issue
  and expiry dates, official HTTPS verification URL, accessible description, public note, redaction
  labels, image/PDF upload/replacement, a local image redaction editor that burns opaque boxes into a
  new JPEG copy, credential visibility, a separate document-publication opt-in (off by default),
  inline card preview and enlarged viewer preview.
- **Privacy** — no credential-ID or verification-code field exists; redactions store labels only;
  uploaded documents stay in the ignored private folder until explicitly opted in and saved; images
  are re-encoded to strip EXIF; PDFs are size/header screened and stored as supplied; hidden
  credentials and private documents are absent from public HTML, the committed content, the
  production bundle and the résumé/PDF. The isolated workflow asserts private bytes are not served
  by the production preview.
- **Persistence** — the existing loopback-only Studio save pipeline writes published
  content-addressed certificate assets under `public/media/`, private drafts under ignored
  `content-studio/private/certificates/`, retains replaced public files under
  `content-studio/retired/`, and includes public certificate references in the publication
  hash/orphan gate.
- **Evidence** — `docs/CERTIFICATIONS.md` and `docs/screenshots/certifications-*.png`. The synthetic
  certificate image in the Studio/viewer captures is clearly labelled as a sample and was never saved.

| Check | Result |
| --- | --- |
| `npm run check` | Pass |
| `npm test` | 110 passed / 10 files |
| `npm run build` | Pass; 22 HTML routes, 21 public routes, 8 project pages, résumé PDF 2 pages |
| `npm run test:e2e` | 41 passed / 2 projects; no retries |
| `npm run test:studio` | Pass; upload → save → restart → fixture build → static asset checks |
| Axe WCAG 2 A/AA + 2.1 A/AA | No serious/critical findings on the certification gallery; existing scans pass |
| Publication gate | `src/content/studio.generated.json` hash re-approved locally; unreviewed changes still fail |
| Private-document gate | Private PDF absent from built HTML; credential name still present |
| Hidden-credential gate | Hidden credential absent from `/certifications/` and résumé |
