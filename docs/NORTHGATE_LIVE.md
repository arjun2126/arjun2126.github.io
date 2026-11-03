# Northgate Motors live experience

Status: implemented as a verified, non-proxying fallback. No deployment, no Salesforce
configuration change and no Owner Portal access.

## Verified public URL

`https://orgfarm-25065ad46a-dev-ed.develop.my.site.com/owners/s/buyer`

The public buyer routes were recovered from the repository's published acceptance record
(`docs/ACCEPTANCE_STATUS.md`), the buyer architecture note and the P8 site-creation evidence.
The base `/owners/s/` route is the authenticated Owner Portal and is not used by ArjunOS.

| Buyer view | Published route | Live result |
|---|---|---|
| Home | `/owners/s/buyer` | 200 |
| Inventory | `/owners/s/buyer-inventory` | 200 |
| 3D Studio | `/owners/s/buyer-studio` | 200 |
| About | `/owners/s/buyer-about` | 200 |
| Contact | `/owners/s/buyer-contact` | 200 |

Checked with an anonymous request on 2026-11-02. The direct browser capture rendered the
published buyer home, including its inventory count and 3D Studio navigation. No credentials
were supplied.

## Framing result

The buyer site cannot be framed by ArjunOS:

```text
HTTP/2 200
content-security-policy: frame-ancestors 'self'
x-frame-options: SAMEORIGIN
```

A real Chromium iframe probe failed with `net::ERR_BLOCKED_BY_RESPONSE` and the browser
reported that framing violates `frame-ancestors 'self'`. This is Salesforce's intended
clickjack protection. ArjunOS does not proxy, rewrite, or bypass it.

## Implemented fallback

`/northgate-live/` opens a dedicated **Northgate Live** window containing:

- a live-demo heading, verified date and public Salesforce host;
- an explicit disclosure that the Salesforce site blocks framing;
- the observed `X-Frame-Options` and CSP evidence;
- verified, genuine captures for Home, Inventory, 3D Studio, About and Contact;
- a loading indicator while each capture is prepared;
- a full-screen preview action;
- **Open Original Website** for every selected route, plus direct **Open inventory** and **Open 3D Studio** live links and a primary **Open the live buyer site** action;
- external links with `target="_blank"` and `rel="noreferrer noopener"`;
- a clear statement that the Owner Portal is excluded and no credentials or session data are used.

The existing Northgate case study is preserved and gains an **Open Live Experience** callout.
There is no iframe, fake interactive copy, proxied response, authenticated route or embedded
Owner Portal.

## Owner approval required for true embedding

No Salesforce security setting was changed. If the owner wants a genuine embedded iframe, the
following change must be approved before it is attempted:

1. Decide the exact production ArjunOS origin (for example, the final custom domain). Do not use
   a wildcard or a localhost origin in production.
2. In Salesforce Setup, review the Experience Cloud site's clickjack/framing configuration and
   CSP trusted-site configuration. The current response is both `X-Frame-Options: SAMEORIGIN`
   and `frame-ancestors 'self'`.
3. Authorize **only that one ArjunOS origin** in the site's `frame-ancestors` policy, and review
   whether removing or relaxing `X-Frame-Options` is required. `X-Frame-Options` has no
   allowlist for a third-party origin, so this is a real security-posture change, not a cosmetic
   setting.
4. Publish the Salesforce change, then verify the exact response headers from the live URL and
   test the iframe in Chromium before changing ArjunOS to load it.
5. Re-run the desktop/mobile checks and review privacy and clickjacking implications.

This proposal is documented only. It requires explicit owner approval and was not applied. The
recommended default is to keep the current external-link fallback, because it preserves
Salesforce's clickjack protection and avoids third-party cookie/session complexity.

## Privacy and scope

- Public buyer routes only; `/owners/s/`, `/owners/s/login` and all `c__view` portal routes are
  excluded.
- No Salesforce credentials, tokens, cookies, session details, private records or administrative
  functions are requested, read or stored.
- The portfolio does not proxy the Salesforce application or present a reconstruction as live.
- The demo data is fictional; the independent-demo disclosure remains in the Northgate case study.

## Verification

- `npm run check`
- `npm test`
- `npm run build`
- `npx playwright test`
- Desktop and mobile screenshots of `/northgate-live/`

Results are recorded in `docs/PROGRESS.md` after the final run.
