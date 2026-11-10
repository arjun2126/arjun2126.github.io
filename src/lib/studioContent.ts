export interface StudioCareerEntry {
  id?: string;
  period: string;
  title: string;
  org: string;
  body: string;
}

export interface StudioMediaItem {
  id: string;
  projectSlug: string;
  caption: string;
  src: string;
  name: string;
}

export interface StudioResume {
  /** Saved web-safe PDF under /media/, or empty when the owner has not supplied one. */
  pdf: string;
  label: string;
}

/**
 * A published credential. Credential IDs and verification codes are deliberately
 * absent: the public copy never stores or renders them. Owners should redact any
 * sensitive identifier from the uploaded document before attaching it.
 */
export interface StudioCertification {
  id: string;
  name: string;
  issuer: string;
  /** ISO date (`YYYY-MM-DD`), or empty when the owner has not published it. */
  issuedOn: string;
  /** ISO date (`YYYY-MM-DD`), or empty when the credential does not expire or the date is unpublished. */
  expiresOn: string;
  /** Official issuer verification page, or empty when no verified URL exists. */
  verificationUrl: string;
  verificationLabel: string;
  kind: 'none' | 'image' | 'pdf';
  /** Public `/media/` asset. Empty unless the document is opted into publication. */
  src: string;
  /**
   * Local-only draft asset (data URL or loopback URL). Persisted outside `public/`
   * and stripped from the committed content file.
   */
  privateSrc: string;
  /**
   * Explicit permission to show the uploaded document on the public site.
   * Uploading a file never publishes it by itself.
   */
  documentVisible: boolean;
  /** Accessible description of the published certificate copy. */
  alt: string;
  /** Labels of details removed from the public copy (never the values themselves). */
  redactions: string[];
  note: string;
  visible: boolean;
}

export const MAX_CERTIFICATIONS = 20;

/**
 * Conservative byte-level screen for active PDF features. This is a speed bump,
 * not a sandbox or a full PDF parser: owners must still supply a sanitized copy.
 * `/URI` and `/ObjStm` are deliberately allowed because ordinary PDFs use them.
 */
const ACTIVE_PDF_FEATURE =
  /\/(?:JavaScript|JS|Launch|EmbeddedFile|EmbeddedFiles|OpenAction|RichMedia|XFA)\b/;

export function pdfHasActiveContent(bytes: string): boolean {
  return ACTIVE_PDF_FEATURE.test(bytes);
}

export interface StudioWalkthrough {
  /** Externally hosted walkthrough URL, or empty until the owner records one. */
  url: string;
  title: string;
  summary: string;
}

export interface StudioProfile {
  name: string;
  headline: string;
  summary: string;
  photo: string;
  github: string;
  x: string;
  linkedin: string;
  contactNote: string;
}

export interface StudioProject {
  slug: string;
  tagline: string;
  summary: string;
  stack: string[];
  /** Optional reviewed overrides; empty values fall back to the registry. */
  name?: string;
  repo?: string;
  link?: string;
  linkLabel?: string;
}

export interface StudioDraft {
  profile: StudioProfile;
  career: {
    experience: StudioCareerEntry[];
    education: string[];
    certifications: string[];
    achievements: string[];
  };
  skills: Array<{ id: string; label: string; items: string[] }>;
  projects: StudioProject[];
  /** Structured credential gallery, including hidden drafts. */
  certifications: StudioCertification[];
  media: StudioMediaItem[];
  resume: StudioResume;
  walkthrough: StudioWalkthrough;
  sources: Array<{ name: string; kind: string; importedAt: string; note: string }>;
}

export interface GeneratedContentFile {
  version: 1;
  updatedAt: string | null;
  content: StudioDraft | null;
}

export const MAX_IMAGE_BYTES = 8_000_000;
export const MAX_PDF_BYTES = 6_000_000;
export const MAX_CERTIFICATE_BYTES = MAX_PDF_BYTES;
export const RESUME_PDF_PATH = '/media/arjunos-resume.pdf';

export type VideoProvider = 'youtube' | 'vimeo' | 'loom' | 'file' | 'external' | 'none';

export interface ClassifiedVideo {
  provider: VideoProvider;
  embedUrl: string | null;
  externalUrl: string;
}

const VIDEO_PROVIDERS: Array<{ provider: VideoProvider; hosts: string[] }> = [
  { provider: 'youtube', hosts: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'] },
  { provider: 'vimeo', hosts: ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'] },
  { provider: 'loom', hosts: ['loom.com', 'www.loom.com'] },
];

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

/**
 * Verification pages are public links. Reject the common query parameters used
 * to carry a credential ID or verification code so a private value is not
 * published by pasting a personalised lookup URL.
 */
export function hasSensitiveVerificationParams(value: string): boolean {
  try {
    const url = new URL(value);
    const forbidden = [
      'id', 'cid', 'code', 'credential', 'credentialid', 'credential_id',
      'verificationcode', 'verification_code',
    ];
    return [...url.searchParams.keys()].some((key) => forbidden.includes(key.toLowerCase()));
  } catch {
    return false;
  }
}

/**
 * Classify an externally hosted walkthrough URL. Only recognised video hosts and
 * direct video files are embedded; anything else stays a plain outbound link so
 * the site never frames an unreviewed page.
 */
export function classifyVideoUrl(rawUrl: string): ClassifiedVideo {
  const url = rawUrl.trim();
  if (!url) return { provider: 'none', embedUrl: null, externalUrl: '' };
  if (!isHttpsUrl(url)) return { provider: 'none', embedUrl: null, externalUrl: '' };

  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();

  if (host === 'youtu.be') {
    const id = parsed.pathname.replace(/^\//, '').split('/')[0];
    return /^[\w-]{11}$/.test(id)
      ? { provider: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, externalUrl: url }
      : { provider: 'external', embedUrl: null, externalUrl: url };
  }

  for (const entry of VIDEO_PROVIDERS) {
    if (!entry.hosts.includes(host)) continue;
    if (entry.provider === 'youtube') {
      const id = parsed.searchParams.get('v') ?? parsed.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
      return id && /^[\w-]{11}$/.test(id)
        ? { provider: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, externalUrl: url }
        : { provider: 'external', embedUrl: null, externalUrl: url };
    }
    if (entry.provider === 'vimeo') {
      const id = parsed.pathname.match(/(\d{6,})/)?.[1];
      return id
        ? { provider: 'vimeo', embedUrl: `https://player.vimeo.com/video/${id}`, externalUrl: url }
        : { provider: 'external', embedUrl: null, externalUrl: url };
    }
    if (entry.provider === 'loom') {
      const id = parsed.pathname.match(/\/([a-f0-9]{32})/)?.[1];
      return id
        ? { provider: 'loom', embedUrl: `https://www.loom.com/embed/${id}`, externalUrl: url }
        : { provider: 'external', embedUrl: null, externalUrl: url };
    }
  }

  if (/\.(mp4|webm|m4v)$/i.test(parsed.pathname)) {
    return { provider: 'file', embedUrl: url, externalUrl: url };
  }

  return { provider: 'external', embedUrl: null, externalUrl: url };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Obvious email, phone or long numeric identifier text; not a full PII detector. */
export function containsPrivateIdentifier(value: string): boolean {
  return (
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(value) ||
    /\b\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/.test(value) ||
    /\b\d{7,}\b/.test(value)
  );
}

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidCertificateAsset(kind: StudioCertification['kind'], src: string): boolean {
  if (kind === 'none') return src === '';
  if (kind === 'image') {
    return /^\/media\/[\w.-]+\.webp$/.test(src) ||
      /^\/__arjunos\/certificate-draft\/[\w.-]+\.webp$/.test(src) ||
      /^data:image\/(?:png|jpe?g|webp);base64,[a-zA-Z0-9+/=\s]+$/.test(src);
  }
  return /^\/media\/[\w.-]+\.pdf$/.test(src) ||
    /^\/__arjunos\/certificate-draft\/[\w.-]+\.pdf$/.test(src) ||
    /^data:application\/pdf;base64,[a-zA-Z0-9+/=\s]+$/.test(src);
}

function isValidPrivateCertificateAsset(kind: StudioCertification['kind'], src: string): boolean {
  if (!src) return true;
  if (kind === 'image') {
    return /^\/__arjunos\/certificate-draft\/[\w.-]+\.webp$/.test(src) ||
      /^\/media\/[\w.-]+\.webp$/.test(src) ||
      /^data:image\/(?:png|jpe?g|webp);base64,[a-zA-Z0-9+/=\s]+$/.test(src);
  }
  if (kind === 'pdf') {
    return /^\/__arjunos\/certificate-draft\/[\w.-]+\.pdf$/.test(src) ||
      /^\/media\/[\w.-]+\.pdf$/.test(src) ||
      /^data:application\/pdf;base64,[a-zA-Z0-9+/=\s]+$/.test(src);
  }
  return false;
}

/**
 * Validate one credential. Dates and verification links are optional by design:
 * when they are unpublished the UI says so rather than implying an active status.
 */
export function validateCertification(
  certification: StudioCertification,
  index = 0,
): string[] {
  const errors: string[] = [];
  const label = certification.name.trim() || `Certificate ${index + 1}`;
  if (!certification.id.trim()) errors.push('Every certificate needs an ID.');
  if (!certification.name.trim()) errors.push('Every certificate needs a name.');
  if (!certification.issuer.trim()) errors.push(`${label} needs an issuing organization.`);
  if (certification.name.length > 160) errors.push('A certificate name is longer than 160 characters.');
  if (certification.issuer.length > 120) errors.push('A certificate issuer is longer than 120 characters.');
  if (certification.issuedOn && !isValidIsoDate(certification.issuedOn)) {
    errors.push(`${label} has an invalid issue date.`);
  }
  if (certification.expiresOn && !isValidIsoDate(certification.expiresOn)) {
    errors.push(`${label} has an invalid expiry date.`);
  }
  if (certification.issuedOn && certification.expiresOn && certification.expiresOn < certification.issuedOn) {
    errors.push(`${label} expires before it was issued.`);
  }
  if (certification.verificationUrl && !isHttpsUrl(certification.verificationUrl)) {
    errors.push(`${label} needs an https:// official verification URL, or leave it blank.`);
  }
  if (hasSensitiveVerificationParams(certification.verificationUrl)) {
    errors.push(
      `${label} verification URL contains a credential ID or verification code parameter. Link to the public verification page instead.`,
    );
  }
  if (certification.verificationLabel.length > 120) {
    errors.push('A verification link label is longer than 120 characters.');
  }
  const textFields: Array<[string, string]> = [
    ['verification link label', certification.verificationLabel],
    ['public note', certification.note],
    ['accessible description', certification.alt],
    ...certification.redactions.map(
      (item): [string, string] => ['redaction label', item],
    ),
  ];
  for (const [field, value] of textFields) {
    if (containsPrivateIdentifier(value)) {
      errors.push(
        `${label} ${field} appears to contain a private identifier. Remove the value and describe it only.`,
      );
    }
  }
  if (certification.documentVisible) {
    if (!isValidCertificateAsset(certification.kind, certification.src)) {
      errors.push(`${label} has an unsupported public certificate document. Use a PNG, JPEG, WebP or PDF.`);
    }
    if (certification.privateSrc) {
      errors.push(`${label} still holds a private document after publication was enabled.`);
    }
  } else if (certification.src) {
    errors.push(`${label} has a public document path while publication is disabled.`);
  }
  if (!isValidPrivateCertificateAsset(certification.kind, certification.privateSrc || '')) {
    errors.push(`${label} has an unsupported private draft document.`);
  }
  if (certification.kind !== 'none' && certification.documentVisible && certification.alt.trim().length < 8) {
    errors.push(`${label} needs an accessible description before its document can be published.`);
  }
  if (typeof certification.documentVisible !== 'boolean') {
    errors.push('Certificate document visibility must be true or false.');
  }
  if (certification.alt.length > 240) errors.push('A certificate description is longer than 240 characters.');
  if (certification.redactions.length > 8) errors.push('A certificate lists more than 8 redactions.');
  if (certification.redactions.some((item) => !item.trim() || item.length > 80)) {
    errors.push('Redaction labels must be short, non-empty descriptions.');
  }
  if (certification.note.length > 400) errors.push('A certificate note is longer than 400 characters.');
  if (typeof certification.visible !== 'boolean') errors.push('Certificate visibility must be true or false.');
  return errors;
}

export function validateContentDraft(draft: StudioDraft): string[] {
  const errors: string[] = [];
  const isImage = (src: string) => !src || /^\/media\/[\w.-]+\.webp$/.test(src) || /^data:image\/(?:png|jpe?g|webp);base64,[a-zA-Z0-9+/=\s]+$/.test(src);
  if (!isImage(draft.profile.photo)) errors.push('Portrait must be an uploaded PNG, JPEG or WebP.');
  if (!Array.isArray(draft.certifications)) {
    errors.push('The certification gallery is missing from this draft.');
  } else {
    if (draft.certifications.length > MAX_CERTIFICATIONS) {
      errors.push(`The certification gallery holds more than ${MAX_CERTIFICATIONS} entries.`);
    }
    if (new Set(draft.certifications.map((item) => item.id)).size !== draft.certifications.length) {
      errors.push('Certificate IDs must be unique.');
    }
    draft.certifications.forEach((certification, index) => {
      errors.push(...validateCertification(certification, index));
    });
  }
  if (draft.media.some((item) => !item.src || !isImage(item.src) || !/^[\w-]+$/.test(item.id) || !/^[\w-]+$/.test(item.projectSlug))) errors.push('Project media contains an invalid image, ID or project slug.');
  if (new Set(draft.media.map((item) => item.id)).size !== draft.media.length) errors.push('Media IDs must be unique.');
  if (!draft.profile.name.trim()) errors.push('A professional name is required.');
  if (!draft.profile.headline.trim()) errors.push('A headline is required.');
  if (!draft.profile.summary.trim()) errors.push('A professional summary is required.');
  if (draft.profile.name.length > 120) errors.push('The name is longer than 120 characters.');
  if (draft.profile.headline.length > 240) errors.push('The headline is longer than 240 characters.');
  if (draft.profile.summary.length > 2000) errors.push('The summary is longer than 2,000 characters.');
  for (const url of [draft.profile.github, draft.profile.linkedin, draft.profile.x]) {
    if (url && !isHttpsUrl(url)) errors.push('Profile links must use https://.');
  }
  if (draft.career.experience.some((entry) => !entry.title.trim() || !entry.body.trim())) {
    errors.push('Every experience entry needs a title and description.');
  }
  if (draft.skills.some((group) => !group.label.trim())) errors.push('Skill groups need labels.');
  if (draft.projects.some((project) => !project.tagline.trim())) {
    errors.push('Every project needs a tagline.');
  }
  for (const project of draft.projects) {
    if (project.name && project.name.length > 120) {
      errors.push('A project title is longer than 120 characters.');
    }
    for (const url of [project.repo, project.link]) {
      if (url && !isHttpsUrl(url)) errors.push('Project links must use https://.');
    }
  }
  if (draft.resume.pdf) {
    const isSaved = /^\/media\/[\w.-]+\.pdf$/.test(draft.resume.pdf);
    const isUpload = draft.resume.pdf.startsWith('data:application/pdf;base64,');
    if (!isSaved && !isUpload) errors.push('The résumé PDF must be an uploaded PDF saved under /media/.');
  }
  if (draft.resume.label.length > 160) errors.push('The résumé label is longer than 160 characters.');
  if (draft.walkthrough.url) {
    const classified = classifyVideoUrl(draft.walkthrough.url);
    if (classified.provider === 'none') {
      errors.push('The walkthrough URL must be a valid https:// address.');
    } else if (classified.provider === 'external') {
      errors.push(
        'The walkthrough must be hosted on YouTube, Vimeo or Loom, or point at a direct .mp4/.webm file.',
      );
    }
  }
  if (draft.walkthrough.title.length > 160) errors.push('The walkthrough title is longer than 160 characters.');
  if (draft.walkthrough.summary.length > 600) {
    errors.push('The walkthrough summary is longer than 600 characters.');
  }
  return errors;
}
