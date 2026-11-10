import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  APPROVED_CERTIFICATION_NAMES,
  APPROVED_CERTIFICATIONS,
  certificationRecords,
  certificationStatus,
  certificationVerification,
  hasPublicDocument,
  isPublicCertification,
  publicCertifications,
} from '../../src/content/certifications';
import { professional } from '../../src/content/professional';
import {
  validateCertification,
  validateContentDraft,
  type StudioCertification,
  type StudioDraft,
} from '../../src/lib/studioContent';

const root = process.cwd();

function certificate(overrides: Partial<StudioCertification> = {}): StudioCertification {
  return {
    id: 'fixture-certificate',
    name: 'Salesforce Certified Fixture',
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
    ...overrides,
  };
}

function draft(overrides: Partial<StudioDraft> = {}): StudioDraft {
  return {
    profile: {
      name: 'Synthetic fixture',
      headline: 'Fixture',
      summary: 'Test only',
      photo: '',
      github: '',
      x: '',
      linkedin: '',
      contactNote: '',
    },
    career: { experience: [], education: [], certifications: [], achievements: [] },
    skills: [],
    projects: [],
    certifications: [],
    media: [],
    resume: { pdf: '', label: '' },
    walkthrough: { url: '', summary: '', title: '' },
    sources: [],
    ...overrides,
  };
}

describe('approved certification record', () => {
  it('preserves exactly the four owner-approved Salesforce entries', () => {
    expect(APPROVED_CERTIFICATIONS).toHaveLength(4);
    expect(APPROVED_CERTIFICATIONS.map((entry) => entry.name)).toEqual([
      ...APPROVED_CERTIFICATION_NAMES,
    ]);
    for (const certification of publicCertifications) {
      expect(APPROVED_CERTIFICATION_NAMES).toContain(certification.name);
    }
    expect(professional.certifications).toEqual(publicCertifications.map((entry) => entry.name));
    for (const certification of APPROVED_CERTIFICATIONS) {
      expect(certification.issuer).toBe('Salesforce');
      expect(certification.visible).toBe(true);
      expect(certification.verificationUrl).toBe('');
      expect(certification.issuedOn).toBe('');
      expect(certification.expiresOn).toBe('');
      expect(certification.kind).toBe('none');
      expect(certification.privateSrc).toBe('');
    }
    expect(certificationRecords.map((entry) => entry.name)).toEqual(
      expect.arrayContaining([...APPROVED_CERTIFICATION_NAMES]),
    );
    expect(new Set(certificationRecords.map((entry) => entry.name)).size).toBe(
      certificationRecords.length,
    );
  });

  it('does not model credential IDs, verification codes or private identifiers', () => {
    for (const certification of certificationRecords) {
      expect(certification).not.toHaveProperty('credentialId');
      expect(certification).not.toHaveProperty('verificationCode');
    }
    const saved = readFileSync(path.join(root, 'src/content/studio.generated.json'), 'utf8');
    expect(saved).not.toMatch(/credentialId|verificationCode|"credential_id"/i);
  });

  it('passes the publication validator without inventing dates or documents', () => {
    expect(validateContentDraft(draft({ certifications: [...certificationRecords] }))).toEqual([]);
  });

  it('only treats visible, named entries as public', () => {
    expect(isPublicCertification(certificate())).toBe(true);
    expect(isPublicCertification(certificate({ visible: false }))).toBe(false);
    expect(isPublicCertification(certificate({ name: '   ' }))).toBe(false);
  });

  it('never publishes an uploaded document without explicit opt-in', () => {
    const uploaded = certificate({
      kind: 'image',
      privateSrc: '/__arjunos/certificate-draft/certificate-fixture.webp',
      alt: 'Salesforce certificate fixture with identifiers redacted.',
    });
    expect(hasPublicDocument(uploaded)).toBe(false);
    expect(hasPublicDocument({ ...uploaded, documentVisible: true })).toBe(false);
    expect(
      hasPublicDocument({
        ...uploaded,
        privateSrc: '',
        src: '/media/certificate-fixture.webp',
        documentVisible: true,
      }),
    ).toBe(true);
    expect(
      hasPublicDocument({
        ...uploaded,
        privateSrc: '',
        src: '/media/certificate-fixture.webp',
        documentVisible: true,
        visible: false,
      }),
    ).toBe(false);
  });
});

describe('certification dates and verification', () => {
  it('labels missing dates as unpublished rather than active', () => {
    expect(certificationStatus(certificate())).toEqual({
      tone: 'undated',
      label: 'Date not published',
    });
    expect(certificationStatus(certificate({ issuedOn: '2024-03-15' }))).toEqual({
      tone: 'published',
      label: 'Issued Mar 2024',
    });
  });

  it('calls an elapsed expiry expired instead of active', () => {
    expect(
      certificationStatus(certificate({ expiresOn: '2024-03-15' }), new Date('2026-11-09T00:00:00Z')),
    ).toEqual({ tone: 'expired', label: 'Expired Mar 2024' });
    expect(
      certificationStatus(certificate({ expiresOn: '2028-03-15' }), new Date('2026-11-09T00:00:00Z')),
    ).toEqual({ tone: 'published', label: 'Expires Mar 2028' });
  });

  it('publishes only a safe https verification URL', () => {
    expect(
      certificationVerification(
        certificate({ verificationUrl: 'https://trailhead.salesforce.com/verify' }),
      ),
    ).toBe('https://trailhead.salesforce.com/verify');
    expect(certificationVerification(certificate({ verificationUrl: 'http://example.test' }))).toBe('');
    // Reserved .test host and explicit fictional userinfo; no real account.
    const fictionalUrl = new URL('https://example.test');
    fictionalUrl.username = 'fictional-fixture-user';
    fictionalUrl.password = ['fictional', 'fixture', 'value'].join('-');
    expect(certificationVerification(certificate({ verificationUrl: fictionalUrl.href }))).toBe('');
    expect(
      certificationVerification(
        certificate({ verificationUrl: 'https://example.test/verify?credentialId=ABC123' }),
      ),
    ).toBe('');
  });

  it('rejects a verification URL that carries a credential ID or code parameter', () => {
    expect(
      validateCertification(
        certificate({ verificationUrl: 'https://example.test/verify?verificationCode=ABC123' }),
      ).some((error) => error.includes('verification code parameter')),
    ).toBe(true);
  });
});

describe('certificate publication validation', () => {
  it('requires an issuer, valid dates and an https verification URL', () => {
    expect(validateCertification(certificate({ issuer: '   ' })).length).toBeGreaterThan(0);
    expect(validateCertification(certificate({ issuedOn: '2024-13-01' })).length).toBeGreaterThan(0);
    expect(
      validateCertification(
        certificate({ issuedOn: '2025-01-01', expiresOn: '2024-01-01' }),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      validateCertification(certificate({ verificationUrl: 'http://example.test/verify' })).length,
    ).toBeGreaterThan(0);
  });

  it('requires an accessible description when a document is attached', () => {
    expect(
      validateCertification(
        certificate({
          kind: 'image',
          src: '/media/certificate-fixture.webp',
          documentVisible: true,
        }),
      ).some((error) => error.includes('accessible description')),
    ).toBe(true);
    expect(
      validateCertification(
        certificate({
          kind: 'image',
          src: '/media/certificate-fixture.webp',
          documentVisible: true,
          alt: 'Salesforce Administrator certificate awarded to Arjun Subramanya.',
        }),
      ),
    ).toEqual([]);
    // A private draft document does not require publication alt text yet.
    expect(
      validateCertification(
        certificate({
          kind: 'image',
          privateSrc: '/__arjunos/certificate-draft/certificate-fixture.webp',
        }),
      ),
    ).toEqual([]);
    expect(
      validateCertification(
        certificate({ kind: 'image', src: '/media/certificate-fixture.webp' }),
      ).some((error) => error.includes('public document path')),
    ).toBe(true);
    expect(
      validateCertification(
        certificate({
          kind: 'pdf',
          src: '/__arjunos/certificate-draft/certificate-fixture.pdf',
          documentVisible: true,
          alt: 'Salesforce certificate fixture PDF.',
        }),
      ),
    ).toEqual([]);
  });

  it('rejects unsupported documents, duplicate IDs and excessive lists', () => {
    expect(
      validateCertification(certificate({ kind: 'pdf', src: '/media/certificate.exe' })).length,
    ).toBeGreaterThan(0);
    const duplicate = draft({
      certifications: [certificate({ id: 'same' }), certificate({ id: 'same' })],
    });
    expect(validateContentDraft(duplicate).some((error) => error.includes('unique'))).toBe(true);
    const many = draft({
      certifications: Array.from({ length: 21 }, (_, index) =>
        certificate({ id: `entry-${index}`, name: `Certificate ${index}` }),
      ),
    });
    expect(validateContentDraft(many).some((error) => error.includes('more than 20'))).toBe(true);
  });

  it('rejects a redaction label that contains the identifier itself', () => {
    expect(
      validateCertification(
        certificate({ redactions: ['Credential ID 123456789012345'] }),
      ).some((error) => error.includes('private identifier')),
    ).toBe(true);
    // Exercise email rejection with a reserved .invalid domain, assembled from
    // explicitly fictional parts rather than a publishable contact address.
    const fictionalEmail = ['fictional-fixture-person', 'example.invalid'].join('@');
    expect(
      validateCertification(certificate({ note: `Synthetic fixture contact: ${fictionalEmail}` })).some((error) =>
        error.includes('private identifier'),
      ),
    ).toBe(true);
  });

  it('accepts a redacted public copy with labelled redactions only', () => {
    const redacted = certificate({
      kind: 'image',
      src: '/media/certificate-fixture.webp',
      privateSrc: '',
      documentVisible: true,
      alt: 'Salesforce Administrator certificate with the credential ID removed.',
      redactions: ['Credential ID', 'Verification code'],
      visible: true,
    });
    expect(validateCertification(redacted)).toEqual([]);
    expect(redacted.redactions.join(' ')).not.toMatch(/\d{6,}/);
  });
});
