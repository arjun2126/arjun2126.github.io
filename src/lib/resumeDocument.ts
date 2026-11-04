/**
 * The downloadable résumé.
 *
 * Built from the same approved content modules that render the web résumé, so
 * the PDF cannot drift from the page or smuggle in unpublished details. Phone
 * numbers, email addresses and credential IDs never enter this document; the
 * build script asserts that before writing the file.
 */
import { profile, resumeCapabilities } from '../content/profile';
import { professional } from '../content/professional';
import { projects } from '../content/projects';

/** Public location of the generated PDF. Kept in sync with scripts/resume-pdf.ts. */
export const RESUME_PDF_PATH = '/resume/arjun-subramanya-resume.pdf';
export const RESUME_PDF_FILENAME = 'Arjun-Subramanya-Resume.pdf';

export function escapeResumeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export interface ResumeFonts {
  /** Base64 WOFF2 for the display serif. */
  serif?: string;
  /** Base64 WOFF2 for the text sans. */
  sans?: string;
}

function fontFaces(fonts: ResumeFonts): string {
  const faces: string[] = [];
  if (fonts.serif) {
    faces.push(
      `@font-face{font-family:'ResumeSerif';src:url(data:font/woff2;base64,${fonts.serif}) format('woff2');font-weight:400;font-style:normal;font-display:block}`,
    );
  }
  if (fonts.sans) {
    faces.push(
      `@font-face{font-family:'ResumeSans';src:url(data:font/woff2;base64,${fonts.sans}) format('woff2');font-weight:100 900;font-style:normal;font-display:block}`,
    );
  }
  return faces.join('');
}

const styles = `
:root{--ink:#101a17;--muted:#4b5651;--rule:#d5d8cf;--accent:#3f5f2a}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff}
body{font-family:'ResumeSans','Helvetica Neue',Arial,sans-serif;color:var(--ink);font-size:9.6pt;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
a{color:inherit;text-decoration:none}
header{display:flex;justify-content:space-between;align-items:flex-end;gap:10mm;border-bottom:1.4pt solid var(--ink);padding-bottom:4mm}
.identity{max-width:120mm}
.kicker{font-size:8pt;text-transform:uppercase;color:var(--accent);margin:0 0 1mm;font-weight:650}
h1{font-family:'ResumeSerif',Georgia,'Times New Roman',serif;font-size:30pt;line-height:.98;margin:0 0 2.5mm;font-weight:400}
.contact{font-size:8.4pt;color:var(--muted);margin:0}
.contact .sep{margin:0 1.6mm;color:#9aa39a}
.availability{font-size:8.2pt;color:var(--muted);text-align:right;max-width:48mm;margin:0 0 1mm}
section{margin-top:6mm}
h2{font-size:8.4pt;text-transform:uppercase;color:var(--accent);margin:0 0 2.6mm;padding-bottom:1.4mm;border-bottom:.6pt solid var(--rule);font-weight:700;break-after:avoid}
p{margin:0 0 2mm}
.role{break-inside:avoid;margin-bottom:4.2mm}
.role:last-child{margin-bottom:0}
.role-head{display:flex;justify-content:space-between;gap:6mm;align-items:baseline}
.role h3{font-size:11.2pt;margin:0;font-weight:650;color:var(--muted);white-space:nowrap}
.role-meta{font-size:8.6pt;color:var(--muted);margin:.6mm 0 1.8mm}
ul{margin:0;padding-left:4.2mm}
li{margin-bottom:1mm}
.tools{font-size:8pt;color:var(--muted);margin:1.4mm 0 0}
table{width:100%;border-collapse:collapse}
td{padding:1.5mm 0;border-bottom:.5pt solid var(--rule);vertical-align:top}
tr:last-child td{border-bottom:0}
.name{font-weight:650;width:46mm}
.cat{text-align:right;color:var(--muted);font-size:8pt;white-space:nowrap}
.caps{display:grid;grid-template-columns:1fr 1fr;gap:2.4mm 8mm}
.cap{break-inside:avoid}
.cap b{display:block;font-size:8pt;text-transform:uppercase;margin-bottom:.6mm}
.creds{display:grid;grid-template-columns:1fr 1fr;gap:8mm}
.cred{break-inside:avoid;margin-bottom:2.4mm}
.cred strong{display:block;font-weight:650}
.cred span{display:block;font-size:8.4pt;color:var(--muted)}
footer{margin-top:7mm;padding-top:3mm;border-top:.6pt solid var(--rule);font-size:7.6pt;color:var(--muted);display:flex;justify-content:space-between;gap:6mm}
`;

export function buildResumeHtml(fonts: ResumeFonts = {}, generatedOn = new Date()): string {
  const esc = escapeResumeHtml;
  const employment = professional.employment
    .map(
      (role) => `<article class="role">
        <div class="role-head">
          <h3>${esc(role.title)}</h3>
          <span class="period">${esc(role.period)}</span>
        </div>
        <p class="role-meta">${esc(role.employer)} · ${esc(role.location)}</p>
        <p>${esc(role.summary)}</p>
        <ul>${role.responsibilities
          .slice(0, 4)
          .map((item) => `<li>${esc(item)}</li>`)
          .join('')}</ul>
        <p class="tools">Tools: ${esc(role.technologies.join(' · '))}</p>
      </article>`,
    )
    .join('');

  const work = projects
    .map(
      (project) => `<tr>
        <td class="name">${esc(project.name)}</td>
        <td>${esc(project.tagline)}</td>
        <td class="cat">${esc(project.category)}</td>
      </tr>`,
    )
    .join('');

  const capabilities = resumeCapabilities
    .map(
      (group) => `<div class="cap"><b>${esc(group.label)}</b><p>${esc(group.items.join(' · '))}</p></div>`,
    )
    .join('');

  const education = professional.education
    .map((entry) => {
      const detail = [entry.institution, entry.location].filter(Boolean).join(' · ');
      return `<div class="cred"><strong>${esc(entry.credential)}</strong><span>${esc(detail)}</span>${
        entry.focus ? `<span>${esc(entry.focus)}</span>` : ''
      }</div>`;
    })
    .join('');

  const certifications = professional.certifications
    .map((certification) => `<li>${esc(certification)}</li>`)
    .join('');

  const generated = generatedOn.toISOString().slice(0, 10);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(profile.name)} — Résumé</title>
<meta name="author" content="${esc(profile.name)}" />
<meta name="description" content="Approved professional résumé for ${esc(profile.name)}: experience, education, certifications, capabilities and public project work." />
<style>${fontFaces(fonts)}${styles}</style>
</head>
<body>
<header>
  <div class="identity">
    <p class="kicker">${esc(profile.title)}</p>
    <h1>${esc(profile.name)}</h1>
    <p class="contact">
      <span>${esc(professional.location)}</span><span class="sep">·</span>
      <span><a href="${esc(profile.github)}">github.com/arjun2126</a></span><span class="sep">·</span>
      <span><a href="${esc(profile.linkedin)}">linkedin.com/in/arjunsubra</a></span>
    </p>
  </div>
  <p class="availability">${esc(professional.availability)}</p>
</header>

<section>
  <h2>Profile</h2>
  <p>${esc(profile.summary)}</p>
  <p>${esc(professional.specialization)}</p>
</section>

<section>
  <h2>Experience</h2>
  ${employment}
</section>

<section>
  <h2>Selected work</h2>
  <table>${work}</table>
</section>

<section>
  <h2>Capabilities</h2>
  <div class="caps">${capabilities}</div>
</section>

<section>
  <h2>Education &amp; certifications</h2>
  <div class="creds">
    <div>${education}</div>
    <div><ul>${certifications}</ul></div>
  </div>
</section>

<footer>
  <span>${esc(profile.name)} · arjun2126.github.io/resume · generated ${generated} from the approved public résumé.</span>
  <span>No phone number, email address or credential ID is published.</span>
</footer>
</body>
</html>`;
}
