# GitHub Pages deployment

The 3 November 2026 owner launch request supersedes the previous local-only authorization.
Only previously approved portfolio content is authorized. No new portrait, PDF, email or private
document is included. The original development workspace stays unchanged.

- Repository: https://github.com/arjun2126/arjun2126.github.io
- Website: https://arjun2126.github.io/
- Preserve `main` history: audited branch → reviewed PR → passing checks → merge. Never force-push.
- Pages source: **GitHub Actions** in Settings → Pages → Build and deployment.
- `.github/workflows/pages.yml` validates PRs and builds/deploys approved merges to `main`.
  Manual dispatch on `main` cannot bypass verification.
- Node 22; `npm ci`; historical/tree privacy scan; TypeScript; unit/API tests; isolated upload test;
  production build/static verification; Chromium browser/accessibility tests, retries disabled.
- `SITE_URL=https://arjun2126.github.io`; Vite base `/`; only `dist/` uploaded through
  `actions/upload-pages-artifact@v3`, then `actions/deploy-pages@v4` with `configure-pages@v5`.
- Default read-only contents permission; deployment alone gets Pages write and OIDC permissions.
  The `github-pages` environment permits `main`, with serialized deployments.
- Twenty public directory-index routes, custom root `404.html`, sitemap, canonicals and `.nojekyll`.
  Unknown URLs must return a real HTTP 404. No SPA redirect is needed.
- Public assets/content require hashes in `publication-approved.json`. Ignored drafts and backups
  cannot silently enter a production build. Studio's local server plugin is not deployed.

See [CONTENT_UPDATES.md](CONTENT_UPDATES.md) for uploads and publication decisions, and
[PROGRESS.md](PROGRESS.md) for verified evidence. Configuration alone is not deployment success.

If API configuration is denied, an administrator must select **GitHub Actions** as the Pages source,
enable Actions if disabled and allow `main` to deploy to `github-pages`. No paid host, domain,
database or authentication service is required.
