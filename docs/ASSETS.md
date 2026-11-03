# Asset register

## Wallpaper

| Field | Value |
| --- | --- |
| Work | Sunset at Tank Lakes, Alpine Lakes Wilderness |
| Creator | U.S. Forest Service – Pacific Northwest Region |
| Source | https://commons.wikimedia.org/wiki/File:Sunset_at_Tank_Lakes,_Alpine_Lakes_Wilderness.jpg |
| Licence | Public domain (U.S. federal government work) |
| Local file | `public/wallpaper-alpine.webp` |
| Transformation | Downloaded 3840 px Wikimedia thumbnail; resized to 2400 px wide; converted to WebP at quality 82 (530 KB) |

The old original vector `public/wallpaper-sierra.svg` remains in the repository as an unused fallback and is not loaded by the current desktop.

## Interface assets

All menu-bar, Dock, window-control, app-mark and project-poster graphics are original CSS/SVG components written for ArjunOS. No Apple wallpaper, app icon, system font file, screenshot or other proprietary macOS asset is bundled. The interface imitates macOS interaction patterns rather than redistributing Apple artwork.

## Photography

| Asset | Status | Rule |
| --- | --- | --- |
| Portrait | **Not supplied as a file** | Upload the original through Content Studio. No generated or substitute likeness. |
| Northgate Motors captures | Repository-published | Existing captions and limitations retained. |
| Nova Grants captures | Reviewed WebP derivatives of public demo captures | Dashboard and app captures have the top 235 px cropped to remove an unrelated demo-account email bar; originals stay ignored. The shipped derivatives are retained. |
| Vantage captures | None found | Typographic cover until the owner uploads genuine screenshots. |
| Care Operations dashboards | Public repository captures with synthetic data | Genuine resized WebP derivatives, as recorded in `SOURCES.md`; retained. |
| Project screenshots uploaded locally | Stored in ignored `public/content-studio/` | Require explicit privacy/rights review before intentional staging. Generated content JSON is also reviewed before committing. |

The repository preparation audit OCR-scanned the public and selected documentation
images. Northgate contact captures contain an explicitly fictional `.test` email;
that is demo data, not an owner contact address. OCR supplements visual review and
cannot prove every pixel is free of private information. Uncropped downloads and
conversation attachments are never commit candidates.

## Fonts

Geist and Instrument Serif are bundled from Fontsource under their respective open licences. No external font CDN is used.
