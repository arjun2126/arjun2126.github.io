# Certifications & Credentials gallery

## Names-only release — owner-approved 10 November 2026

- Clean release branch: `release/certifications-gallery-clean`
- Base: `main`
- Publication uses the reviewed PR, squash merge and existing GitHub Pages workflow after all verification gates pass.
- Approval covers the four certification names and Salesforce issuer only. Original documents, identifiers, dates and private verification links remain unpublished; document-publication flags are disabled.

The gallery is available locally at `/certifications/` and from the sidebar, Dock, File and View menus, Recruiter Mode and the homepage certification summary.

## What the section includes

- A dedicated responsive `Certifications` window with four cards: credential name, issuer, published date status, verification status and an image/PDF preview when supplied.
- A keyboard-accessible enlarged viewer for genuine owner-uploaded images and PDFs. Escape closes it, Tab is trapped inside it, arrow keys move between credentials, and focus returns to the trigger.
- Official verification links only when an HTTPS URL has been supplied and saved.
- Certification summaries on the homepage, Recruiter Mode overview and Credentials tab.
- Static prerendering, route metadata, canonical URL, sitemap entry and `EducationalOccupationalCredential` JSON-LD.
- Mobile document mode with the same content and no horizontal overflow.
- No changes to the existing web résumé or generated downloadable PDF apart from using the same public certification name list.

## Certifications ready for publication

These four names are already approved for publication and remain unchanged. No issue date, expiry date, verification URL, credential ID or certificate document was present in the repository or the approved handoff, so those fields are explicitly unpublished rather than invented.

| # | Credential | Issuer | Published dates | Verification link | Document | Public |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Salesforce Certified Administrator | Salesforce | Not published | Not published | Not published | Yes |
| 2 | Salesforce Certified Platform App Builder | Salesforce | Not published | Not published | Not published | Yes |
| 3 | Salesforce Certified Platform Developer I | Salesforce | Not published | Not published | Not published | Yes |
| 4 | Salesforce Certified Agentforce Specialist | Salesforce | Not published | Not published | Not published | Yes |

The public record never calls these credentials active, current or verified. An unpublished date is displayed as “Date not published”; an elapsed expiry date is displayed as “Expired”.

## Privacy controls

- **No credential IDs or verification codes are modelled at all.** There is no field that stores them, so they cannot leak into the JSON, HTML, résumé or PDF.
- **Images can be redacted in Studio.** The local editor burns opaque boxes into a new JPEG copy, so the redacted area is no longer recoverable from the published file. The same panel records labels such as “Credential ID” or “Verification code” to explain what was removed; the public card never renders the underlying value.
- **PDF redaction is external.** PDFs must be exported as a sanitized public copy; the redaction editor explicitly does not claim to redact PDF content.
- **Certificate documents are opt-in.** Uploading a file keeps it outside `public/`. The owner must enable *Publish certificate document* and save before the image/PDF is copied into `public/media/`.
- **Private documents are not shipped.** A private upload is written to the ignored `content-studio/private/certificates/` directory, served only by the loopback development server, stripped from `src/content/studio.generated.json`, and never served by the production build. The isolated workflow asserts that the production preview cannot return the private bytes, and Vite's static middleware denies the private folder. A saved private draft can still be promoted later without re-uploading: the server copies the local file into `public/media/` when publication is enabled.
- **Credential visibility is separate.** Hiding a credential removes it from the homepage, Recruiter Mode, résumé, generated PDF and `/certifications/` while retaining it in the local draft.
- **Image metadata is stripped.** Uploaded certificate images are resized and re-encoded through `sharp` (server) or canvas JPEG (Studio preview), which drops EXIF/XMP metadata.
- **PDFs are screened, not silently rewritten.** The server checks the `%PDF-` header and size, then rejects a conservative set of active features (`/JavaScript`, `/JS`, `/Launch`, `/EmbeddedFile`, `/OpenAction`, `/RichMedia`, `/XFA`). This is a byte-level speed bump, not a PDF parser or sandbox. PDFs are stored byte-for-byte, so the owner must export a sanitized public copy.
- **Verification URLs must be HTTPS.** Non-HTTPS, credential-bearing (`user:pass@`) and malformed URLs fail validation. Common credential-bearing query keys (`id`, `code`, `cid`, `credentialId`, `verificationCode`, etc.) are rejected; the Studio tells the owner to link to the public verification page instead.
- **Publication hashes are explicit.** `src/content/studio.generated.json` is recorded in `publication-approved.json`; unreviewed changes fail the build.

## Content Studio workflow

1. Run `npm run dev` and open `/content-studio/`.
2. Open **Certifications**.
3. Edit the name, issuer, optional dates, verification URL and its label.
4. Upload a PNG/JPEG/WebP or PDF public copy. Uploading holds the document privately.
   For images, choose **Redact image** to burn boxes over credential IDs or private details before saving.
5. Review the inline card preview and click **Preview** to inspect the enlarged viewer.
6. Optionally enable **Publish certificate document**.
7. Use the arrows to reorder. Use **Publicly visible** to control the public record.
8. Choose **Save to project**, review the diff, then record approval for the exact files.

Published assets use content-addressed names under `public/media/certificate-<id>-<hash>.webp|pdf`. Private drafts use `content-studio/private/certificates/` and a loopback-only `/__arjunos/certificate-draft/` URL. Replaced public files are retained under the ignored `content-studio/retired/` folder rather than deleted. The committed content file stores no private path; after clearing browser storage, a private draft must be reattached even though its ignored file remains on disk.

## Local preview

```bash
npm run build
npm run preview -- --port 4173 --strictPort
```

Open <http://127.0.0.1:4173/certifications/>. The production preview intentionally ignores this browser's local Studio draft.

## Verification evidence — 9 November 2026

| Check | Result |
| --- | --- |
| `npm run check` | Pass |
| `npm test` | 110 passed across 10 files |
| `npm run build` | Pass; 22 HTML routes, 21 public routes, 8 project pages, résumé PDF generated |
| `npm run test:e2e` | 41 passed (desktop + mobile); no retries |
| `npm run test:studio` | Pass: browser upload → save → restart → fixture build → static asset checks |
| Axe WCAG 2 A/AA + 2.1 A/AA | No serious or critical findings on the certification gallery; existing home, project, résumé and recruiter scans still pass |
| Mobile 390 × 844 | No horizontal overflow across all routes, including `/certifications/` |
| No-JavaScript route | `/certifications/` renders the four names, privacy notice and document status |
| Private document gate | Isolated Studio workflow confirmed a privately held PDF stays out of `public/`, the committed JSON, the built HTML and the production preview while the credential name remains |
| Hidden credential gate | Isolated Studio workflow confirmed a hidden credential is absent from `/certifications/` and the résumé |
| Upload validation | Unit/API tests cover image EXIF removal, PDF byte preservation, active-content rejection, unsafe paths, duplicate IDs and date/URL rules |

Screenshots (in `docs/screenshots/`):

- `certifications-desktop-1600.png` — public gallery window.
- `certifications-home-1600.png` — homepage certification summary.
- `certifications-recruiter-1600.png` — Recruiter Mode credentials.
- `certifications-mobile-390.png` — mobile document view.
- `certifications-studio-draft-1600.png` — Studio draft with the document held privately.
- `certifications-viewer-1600.png` — enlarged viewer using a synthetic “SAMPLE — NOT A REAL CERTIFICATE” image. The sample exists only in that browser draft and was never saved to project content or `public/`.

## Known limitations / owner inputs

- The four approved names have **no published dates or official verification URLs**; the gallery says so. Add them only from the owner's own Salesforce verification records.
- **No genuine certificate image or PDF is published.** Upload a redacted public copy through Content Studio, then explicitly opt the document in.
- PDF metadata is not rewritten. The Studio requires the owner to supply a sanitized copy and the save rejects active content, but this is not a substitute for reviewing the document.
- Browser storage is not a publication archive. Save to project and commit the reviewed assets.
- The original feature branch and its history remain untouched. Clean-release checks and authorization are recorded in `docs/PROGRESS.md`.
