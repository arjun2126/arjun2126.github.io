# Owner content updates

1. Run `npm ci` once, then `npm run dev`. Open the printed local URL with
   `/content-studio/` appended. The public site has no save API.
2. **Professional Profile**: upload the genuine portrait; edit biography and public links.
   **Career**: reviewed employment, education and certifications. **Skills**: capability groups.
   **Projects**: titles, descriptions, technologies and HTTPS links.
3. **Media**: choose a project, upload PNG/JPEG/WebP captures (maximum 8 MB each), edit captions
   and reorder with arrows. The first image is the cover; verified source-gallery evidence remains.
   Remove an uploaded item and upload its replacement to replace a previously uploaded image.
4. **Résumé**: upload an approved web-safe PDF (maximum 6 MB), then download it for review.
   The web résumé and print action remain. Document text import is a separate operation.
5. **Walkthrough**: optionally add a genuine recording's YouTube, Vimeo, Loom or direct HTTPS
   MP4/WebM URL, title and description. Leave empty until supplied. `/walkthrough/` shows an honest
   placeholder otherwise. External players connect to the video provider only after a click.
6. Choose **Preview site**, then **Save to project**. The save writes
   `src/content/studio.generated.json` and optimized assets under `public/media/`.
   Local JSON snapshots stay ignored under `content-studio/`. Saved changes survive refresh,
   server restart and build. Browser storage has a quota; if full, save to project before closing.
7. Review the exact text, images and PDF for privacy, accuracy, authenticity and publication rights.
   Remove phone, street address, credential IDs and private details, including PDF metadata.
   File validation is not a guarantee of privacy or malware safety.
8. **Make an explicit publication decision.** Record approval for exact reviewed files:

   ```bash
   npx tsx scripts/validate-publication.ts --approve --owner-reviewed \
     src/content/studio.generated.json public/media/EXACT-UPLOADED-FILENAME.webp
   ```

   Use the actual filenames shown by `git status --short`. Include the PDF/screenshot paths as
   applicable. Do not approve everything with a wildcard. Builds fail on unreviewed public content.
9. Run `npm run publish:prepare`: validates, typechecks, runs unit/API tests, isolated upload
   roundtrip, production build, browser/accessibility checks and reports the diff.
   `npm run publish:prepare -- --stage` also stages reviewed content/assets and audits the index.
   Neither command commits or pushes. Review `git diff --cached` and actual media before committing.
10. Create an update branch, commit only reviewed files, push that branch and open a PR to `main`.
    Merge only after independent review and the Actions verify job passes. Approved merges to
    `main` deploy automatically. Check the actual public site after deployment.

## Safety and recovery

- A public branch exposes committed contents immediately, before Pages runs. Audit before any push.
- No email/phone publication is approved. Portrait, PDF, Vantage captures and video are still pending.
- Existing verified source-gallery images are intentionally retained. Removing those is an engineering
  change requiring review, not a silent Studio action.
- Content snapshots are local, not a published backup service. Keep full-resolution originals outside
  `public/`. Unreferenced uploads must not remain in `public/`; the build rejects orphaned media.
  The local save retains retired managed media under ignored `content-studio/retired/`.
- To undo committed content, use a normal reviewed revert commit; never force-push or rewrite `main`.
- Pattern scanning and recorded approval hashes are guardrails, not proof of publication safety.

## Missing owner inputs

The portrait and 16 Vantage captures are present but still await recorded approval. A genuine
hosted walkthrough recording remains outstanding. No résumé PDF is published: the supplied file
contains private contact details and unverified claims, so it stays private until a redacted,
reviewed version is approved. Existing Northgate, Nova Grants and Care Operations screenshots
remain available and may be supplemented with reviewed genuine uploads.
