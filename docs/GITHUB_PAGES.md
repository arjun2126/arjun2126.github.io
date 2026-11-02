# GitHub repository and Pages preparation

## Current authorization

Local preparation and a local commit only. Do not push, merge, enable Pages,
deploy, buy a domain, or publish without a new owner authorization.

The preparation branch descends from the remote's existing `main` README commit
`84ef0fa39e98e4564d08a3081b6a647d784096a2`. Never replace that history or force-push.

## Static hosting contract

- Repository: <https://github.com/arjun2126/arjun2126.github.io>.
- Approved production origin: `https://arjun2126.github.io` (user site, no repository subpath).
- Vite `base` is explicitly `/`.
- `npm run build` defaults `SITE_URL` to that public origin for canonical URLs,
  Open Graph URLs and sitemap generation. An explicit `SITE_URL` may override it
  for a separately approved host; it is public build metadata, not a secret.
- Only `dist/` is a hosting artifact. Source files, conversation imports,
  authoring backups, test reports and environment files must never be uploaded.
- Nineteen public directory-index routes plus `404.html` are prerendered;
  `404/index.html` is an additional identical copy. Local links/assets, metadata,
  sitemap and `.nojekyll` are verified during every build.
- GitHub Pages uses root `404.html` for unknown URLs. Do not add SPA redirects:
  direct routes already have their own static HTML documents.
- Content Studio has no production save endpoint. Its client is gated to
  loopback hosts. Uploaded assets and generated JSON require a new privacy review
  before intentional staging; `.gitignore` alone cannot prevent content publication.

## Future activation — NOT performed

After separate approval, use GitHub Actions as the Pages source, not branch
publishing. A future deployment workflow should be **manual (`workflow_dispatch`)
only**, require a protected `github-pages` environment reviewer, build/test with
Node 22 and `npm ci`, install Chromium with Playwright, and upload **only `dist/`**
using the official Pages artifact action. Give `pages: write` and `id-token: write`
only to the deployment job, and serialize deployments with a Pages concurrency
group. Do not add push-triggered deployment.

No deploy workflow is included in this commit: merely pushing this branch must
not execute a repository-provided deployment. Existing remote Pages settings were
not changed or activated and must be checked by the owner before any first push.

## Reproduce local validation

```bash
npm ci
npm run check
npm test
npm run build
CI=1 npm run test:e2e -- --retries=0
```

For explicit no-retry runs use `CI=1 npx playwright test --retries=0` after building;
the `test:e2e` script also builds. Git ignore probes and the full reviewed file
manifest are recorded in `REPOSITORY_PREPARATION.md` and `FIRST_COMMIT_FILES.txt`.
