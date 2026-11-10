# Certifications release blocker remediation — 10 November 2026

**Current authorization:** after the remediation below, the owner approved the recommended separate clean clone/new branch approach. This document preserves the investigation and historical hold; `docs/PROGRESS.md` records the clean release. No original commit or branch is rewritten or deleted, and the audit remains unchanged.

## Approved scope and preservation

Four owner-approved Salesforce certification names and the Salesforce issuer only. Original documents, identifiers, dates and private verification links remain excluded. All document-publication flags are off. The original authoring clone, saved draft and private documents are untouched. Remediation is confined to the separate release worktree; no runtime architecture or audit policy changes are included.

## Fixture classification and history gate

The two findings are in `tests/unit/certifications.test.ts` in the sole unpublished commit `91bb13e2aa1f746ac68c79467fa2d222ea97e12d`, blob `ced53607b752678e744bfce65c93371ea191e6ee`:

- Original line 172: rejected userinfo URL under the reserved `.test` domain, with literal fictional username/password components. Replaced by a URL object populated with explicitly fictional fixture components.
- Original line 273: rejected email-bearing note using the reserved example domain. Replaced with fictional contact components under the reserved `.invalid` domain.

Both are negative tests, not owner credentials or contact details. Rejection coverage is retained. No scanner suppression, allowlist, disabled check or audit policy change was made.

Independent history inspection confirmed that neither literal exists on remote `main`, and that the candidate is the only unpublished commit. A corrective descendant cannot clear the unchanged history audit: `git rev-list --all` still includes the original blob. **Publication remains stopped pending explicit approval of history remediation.**

Recommended approval scope: create a separate clean clone and new release branch based on `origin/main`, apply the reviewed aggregate gallery plus remediation as new commits, audit the complete proposed history, and use the existing PR/Pages workflow only after all checks and review pass. Preserve both existing local branches and all remote history; no force-push or replacement of existing commits. No such clone/branch or replacement history has been created automatically.

## Filesystem protections

`vite.config.ts` retains all installed Vite 6 defaults (`.env`, `.env.*`, certificate/key formats and `.git`), then adds `.key` and private Studio directory restrictions. A real-configuration regression compares the configured deny rules with Vite's resolved defaults, making future missing defaults a failing test.

Tests cover 12 protected paths through static, raw-import and absolute-filesystem requests. They require HTTP 403 and no fixture bytes for environment files, keys, Git internals and private certificate/recovery files. Legitimate public assets, private loopback Studio save, exact PDF bytes after server restart and state access remain available. Cross-origin and hostile-Host private requests are rejected. All filesystem tests use a disposable fictional fixture, never owner files.

## Public wording

Removed verification/source-availability claims from the React gallery, static page, mobile teaser, desktop window subtitle, homepage note and metadata. Public copy explicitly limits this release to names/issuer and makes no validity or independent-verification claim. Desktop, mobile, metadata and no-JavaScript assertions cover these surfaces. Layout and navigation structures remain intact.

## Verification method

The normal local Playwright configuration can reuse an already-running preview on port 4173. That server is the owner's separate authoring preview, not this worktree's build. Remediation tests therefore use a session-only configuration on isolated port 4287 with server reuse disabled. One existing root-navigation assertion now derives its expected URL from Playwright's configured `baseURL` instead of hardcoding a port; its root-route/origin requirement is unchanged. No owner server was stopped or navigated.

## Final results

| Check | Result |
| --- | --- |
| TypeScript | Pass |
| Unit/API tests | 125 pass, including 15 real-config filesystem/privacy tests |
| Production build | Pass; publication/static validation and generated résumé PDF pass |
| Browser regressions | 41 pass, no retries; isolated preview of this worktree |
| Content Studio | Upload/save/reload/restart/build/static privacy workflow passes |
| Production résumé download | HTTP 200, application/pdf, valid PDF header |
| Desktop/mobile visual inspection | Pass; layout/navigation preserved |
| Staged security audit | Pass; 14 remediation paths |
| Private-document fingerprint scan | No matches across tracked/new/production files and 317 historical blobs |
| Independent code review | Accepted; no remaining code blockers |
| Unchanged history audit | Blocked: only the two synthetic original fixtures in `91bb13e` |

No new commit, history remediation, push, merge or deployment occurred. Explicit approval for the clean-branch/clone approach remains required.
