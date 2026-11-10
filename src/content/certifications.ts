/**
 * Certifications and credential sources.
 *
 * The four entries below are the owner-approved Salesforce certifications
 * recorded in the 2 November 2026 professional handoff. Issue dates, expiry
 * dates, verification URLs and certificate documents were not supplied, so the
 * published record intentionally says they are not published rather than
 * guessing or describing any credential as active.
 *
 * Credential IDs and verification codes are never modelled here. Owners can
 * attach a redacted public copy through Content Studio; the private values stay
 * out of the build.
 */
import { generatedDraft } from './generated';
import {
  hasSensitiveVerificationParams,
  type StudioCertification,
} from '../lib/studioContent';

export const APPROVED_CERTIFICATION_NAMES = [
  'Salesforce Certified Administrator',
  'Salesforce Certified Platform App Builder',
  'Salesforce Certified Platform Developer I',
  'Salesforce Certified Agentforce Specialist',
] as const;

export const APPROVED_CERTIFICATIONS: StudioCertification[] = [
  {
    id: 'salesforce-certified-administrator',
    name: APPROVED_CERTIFICATION_NAMES[0],
    issuer: 'Salesforce',
    issuedOn: '',
    expiresOn: '',
    verificationUrl: '',
    verificationLabel: '',
    kind: 'none',
    src: '',
    privateSrc: '',
    documentVisible: false,
    alt: '',
    redactions: [],
    note: '',
    visible: true,
  },
  {
    id: 'salesforce-certified-platform-app-builder',
    name: APPROVED_CERTIFICATION_NAMES[1],
    issuer: 'Salesforce',
    issuedOn: '',
    expiresOn: '',
    verificationUrl: '',
    verificationLabel: '',
    kind: 'none',
    src: '',
    privateSrc: '',
    documentVisible: false,
    alt: '',
    redactions: [],
    note: '',
    visible: true,
  },
  {
    id: 'salesforce-certified-platform-developer-i',
    name: APPROVED_CERTIFICATION_NAMES[2],
    issuer: 'Salesforce',
    issuedOn: '',
    expiresOn: '',
    verificationUrl: '',
    verificationLabel: '',
    kind: 'none',
    src: '',
    privateSrc: '',
    documentVisible: false,
    alt: '',
    redactions: [],
    note: '',
    visible: true,
  },
  {
    id: 'salesforce-certified-agentforce-specialist',
    name: APPROVED_CERTIFICATION_NAMES[3],
    issuer: 'Salesforce',
    issuedOn: '',
    expiresOn: '',
    verificationUrl: '',
    verificationLabel: '',
    kind: 'none',
    src: '',
    privateSrc: '',
    documentVisible: false,
    alt: '',
    redactions: [],
    note: '',
    visible: true,
  },
];

/** Fill fields added after an earlier Studio save, without inventing content. */
export function normalizeCertification(
  certification: Partial<StudioCertification>,
  index = 0,
): StudioCertification {
  return {
    id: certification.id?.trim() || `certificate-${index + 1}`,
    name: certification.name ?? '',
    issuer: certification.issuer ?? '',
    issuedOn: certification.issuedOn ?? '',
    expiresOn: certification.expiresOn ?? '',
    verificationUrl: certification.verificationUrl ?? '',
    verificationLabel: certification.verificationLabel ?? '',
    kind: certification.kind ?? 'none',
    src: certification.src ?? '',
    privateSrc: certification.privateSrc ?? '',
    documentVisible: certification.documentVisible === true,
    alt: certification.alt ?? '',
    redactions: Array.isArray(certification.redactions)
      ? certification.redactions.filter(
          (item): item is string => typeof item === 'string' && Boolean(item.trim()),
        )
      : [],
    note: certification.note ?? '',
    visible: certification.visible !== false,
  };
}

function savedCertifications(): StudioCertification[] | null {
  const saved = generatedDraft?.certifications;
  if (Array.isArray(saved)) return saved.map((entry, index) => normalizeCertification(entry, index));
  // Older drafts kept names only. Preserve the approved names rather than
  // inventing dates, issuers or documents.
  const legacy = generatedDraft?.career?.certifications;
  if (Array.isArray(legacy) && legacy.some(Boolean)) {
    return legacy.filter(Boolean).map((name, index) =>
      normalizeCertification({ id: `certificate-${index + 1}`, name, issuer: 'Salesforce', visible: true }, index),
    );
  }
  return null;
}

/** Every credential in the local draft, including hidden ones. */
export const certificationRecords: StudioCertification[] =
  savedCertifications() ?? APPROVED_CERTIFICATIONS.map((entry) => ({ ...entry }));

/** The subset that may appear in public views and the generated résumé. */
export const publicCertifications: StudioCertification[] = certificationRecords.filter(
  (certification) => certification.visible && Boolean(certification.name.trim()),
);

export const certificationNames = publicCertifications.map((certification) => certification.name);

export function isPublicCertification(certification: StudioCertification): boolean {
  return certification.visible && Boolean(certification.name.trim());
}

/** A document only appears publicly after the owner opts the file in. */
export function hasPublicDocument(certification: StudioCertification): boolean {
  return (
    isPublicCertification(certification) &&
    certification.documentVisible &&
    (certification.kind === 'image' || certification.kind === 'pdf') &&
    Boolean(certification.src) &&
    !certification.privateSrc
  );
}

/** The draft asset to show in Studio previews, never in public views. */
export function certificateDraftDocument(certification: StudioCertification): string {
  return certification.documentVisible ? certification.src : certification.privateSrc;
}

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export type CertificationStatusTone = 'published' | 'expired' | 'undated';

export interface CertificationStatus {
  tone: CertificationStatusTone;
  label: string;
}

/**
 * Neutral date status. It never labels a credential "active": an unpublished
 * date is shown as such, and an expired date is called expired.
 */
export function certificationStatus(
  certification: StudioCertification,
  now: Date = new Date(),
): CertificationStatus {
  const issued = formatDate(certification.issuedOn);
  const expires = formatDate(certification.expiresOn);
  if (certification.expiresOn && isValidExpiry(certification.expiresOn, now)) {
    return { tone: 'expired', label: `Expired ${expires}` };
  }
  if (expires) return { tone: 'published', label: `Expires ${expires}` };
  if (issued) return { tone: 'published', label: `Issued ${issued}` };
  return { tone: 'undated', label: 'Date not published' };
}

function isValidExpiry(value: string, now: Date): boolean {
  const expiry = new Date(`${value}T23:59:59Z`);
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() < now.getTime();
}

/** The official verification URL, only when it is a valid https address. */
export function certificationVerification(certification: StudioCertification): string {
  const raw = certification.verificationUrl.trim();
  if (!raw || hasSensitiveVerificationParams(raw)) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    return raw;
  } catch {
    return '';
  }
}

export function certificationViewerLabel(certification: StudioCertification): string {
  return `${certification.name || 'Certificate'} certificate viewer`;
}

export function certificationDates(certification: StudioCertification): string {
  const parts = [];
  if (certification.issuedOn) parts.push(`Issued ${formatDate(certification.issuedOn)}`);
  if (certification.expiresOn) parts.push(`Expires ${formatDate(certification.expiresOn)}`);
  return parts.join(' · ');
}
