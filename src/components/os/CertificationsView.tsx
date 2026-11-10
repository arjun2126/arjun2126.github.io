import {
  ArrowRight,
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  certificateDraftDocument,
  certificationStatus,
  certificationVerification,
  hasPublicDocument,
  publicCertifications,
  type CertificationStatus,
} from '../../content/certifications';
import type { StudioCertification } from '../../lib/studioContent';
import { AppLink } from '../../lib/navigation';

function StatusPill({ status }: { status: CertificationStatus }) {
  return (
    <span className={`os-cert-status os-cert-status--${status.tone}`}>
      <CalendarDays size={11} aria-hidden="true" />
      {status.label}
    </span>
  );
}

function CertificatePreviewMedia({
  certification,
  priority = false,
  enlarge = false,
  showDocument = true,
}: {
  certification: StudioCertification;
  priority?: boolean;
  enlarge?: boolean;
  showDocument?: boolean;
}) {
  if (showDocument && certification.kind === 'image' && certification.src) {
    return (
      <img
        src={certification.src}
        alt={certification.alt || `Certificate document for ${certification.name}`}
        loading={enlarge || priority ? 'eager' : 'lazy'}
        decoding="async"
        // The preview box reserves its aspect ratio, so no layout shift occurs
        // while a certificate image is decoded.
        fetchPriority={priority ? 'high' : 'auto'}
      />
    );
  }

  if (showDocument && certification.kind === 'pdf' && certification.src) {
    return (
      <span className={`os-cert-pdf${enlarge ? ' os-cert-pdf--large' : ''}`}>
        <FileText size={enlarge ? 34 : 26} aria-hidden="true" />
        <span>PDF certificate</span>
        <span className="os-cert-pdf__hint">
          {enlarge ? 'Review the document below or open it in a new tab.' : 'Open to review the document.'}
        </span>
      </span>
    );
  }

  return (
    <span className="os-cert-empty">
      <Award size={enlarge ? 38 : 28} aria-hidden="true" />
      <span>
        {certification.kind === 'none'
          ? 'Certificate document not published'
          : 'Certificate document held privately'}
      </span>
    </span>
  );
}

export function CertificationCard({
  certification,
  onOpen,
  hidden = false,
  priority = false,
  previewDocuments = false,
}: {
  certification: StudioCertification;
  onOpen?: (certification: StudioCertification) => void;
  hidden?: boolean;
  priority?: boolean;
  /** Studio previews may inspect a document before opting it into publication. */
  previewDocuments?: boolean;
}) {
  const status = certificationStatus(certification);
  const verification = certificationVerification(certification);
  const documentSrc = previewDocuments
    ? certificateDraftDocument(certification)
    : hasPublicDocument(certification)
      ? certification.src
      : '';
  const hasVisibleDocument =
    (certification.kind === 'image' || certification.kind === 'pdf') && Boolean(documentSrc);
  const canOpen = hasVisibleDocument && Boolean(onOpen);
  const titleId = useId();
  const preview = (
    <CertificatePreviewMedia
      certification={{ ...certification, src: documentSrc }}
      priority={priority}
      showDocument={hasVisibleDocument}
    />
  );

  return (
    <article
      className={`os-cert-card${hidden ? ' is-hidden-draft' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="os-cert-card__media">
        {canOpen ? (
          <button
            type="button"
            className="os-cert-card__preview"
            aria-label={`Open ${certification.name} certificate viewer`}
            onClick={() => onOpen?.(certification)}
          >
            {preview}
            <span className="os-cert-card__zoom" aria-hidden="true">
              Enlarge
            </span>
          </button>
        ) : (
          <div className="os-cert-card__preview os-cert-card__preview--static">
            {preview}
          </div>
        )}
        {hidden ? <span className="os-cert-card__draft">Hidden from public</span> : null}
      </div>

      <div className="os-cert-card__body">
        <p className="os-cert-card__issuer">{certification.issuer || 'Issuer not published'}</p>
        <h3 id={titleId}>{certification.name}</h3>
        <div className="os-cert-card__meta">
          <StatusPill status={status} />
        </div>
        {certification.note ? <p className="os-cert-card__note">{certification.note}</p> : null}
        {certification.kind !== 'none' && !certification.documentVisible ? (
          <p className="os-cert-card__private">
            <ShieldCheck size={11} aria-hidden="true" /> Document held privately and not published.
          </p>
        ) : null}
        {certification.redactions.length ? (
          <p className="os-cert-card__redactions">
            <ShieldCheck size={11} aria-hidden="true" /> Redacted from this public copy:{' '}
            {certification.redactions.join(', ')}.
          </p>
        ) : null}
        {verification ? (
          <a
            className="os-cert-card__verify"
            href={verification}
            target="_blank"
            rel="noreferrer noopener"
          >
            {certification.verificationLabel || 'Official verification'}
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        ) : (
          <span className="os-cert-card__verify os-cert-card__verify--muted">
            Verification link not published
          </span>
        )}
      </div>
    </article>
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), iframe, object, embed, input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function CertificateViewer({
  certification,
  index,
  count,
  onClose,
  onPrevious,
  onNext,
  allowPrivateDocument = false,
}: {
  certification: StudioCertification;
  index: number;
  count: number;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  /** Explicit opt-in for the local Studio preview, never used by public views. */
  allowPrivateDocument?: boolean;
}) {
  const baseId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeAction = useRef(onClose);
  const previousAction = useRef(onPrevious);
  const nextAction = useRef(onNext);
  closeAction.current = onClose;
  previousAction.current = onPrevious;
  nextAction.current = onNext;
  const status = certificationStatus(certification);
  const verification = certificationVerification(certification);
  const documentSrc =
    allowPrivateDocument && !certification.documentVisible
      ? certification.privateSrc
      : hasPublicDocument(certification)
        ? certification.src
        : '';
  const hasViewerDocument =
    (certification.kind === 'image' || certification.kind === 'pdf') &&
    Boolean(documentSrc);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const root = document.getElementById('root');
    document.body.style.overflow = 'hidden';
    root?.setAttribute('inert', '');
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAction.current();
        return;
      }
      if (event.key === 'ArrowLeft' && previousAction.current) {
        event.preventDefault();
        previousAction.current();
        return;
      }
      if (event.key === 'ArrowRight' && nextAction.current) {
        event.preventDefault();
        nextAction.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((element) => !element.hasAttribute('hidden'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      root?.removeAttribute('inert');
      previous?.focus();
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="os-cert-viewer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="os-cert-viewer__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${certification.name || 'Certificate'} certificate viewer`}
        aria-describedby={`${baseId}-issuer`}
        tabIndex={-1}
      >
        <header className="os-cert-viewer__head">
          <div>
            <p className="os-cert-viewer__eyebrow">
              {certification.issuer} · Certificate {index + 1} of {count}
            </p>
            <h2 id={`${baseId}-title`}>{certification.name}</h2>
            <p id={`${baseId}-issuer`} className="os-cert-viewer__meta">
              <StatusPill status={status} />
              {certification.documentVisible
                ? ' Published certificate document.'
                : hasViewerDocument
                  ? ' Draft document held privately.'
                  : ' Document not published.'}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="os-cert-viewer__close"
            aria-label="Close certificate viewer"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="os-cert-viewer__body">
          <div className="os-cert-viewer__stage">
            {certification.kind === 'image' && documentSrc ? (
              <CertificatePreviewMedia
                certification={{ ...certification, src: documentSrc }}
                enlarge
                priority
              />
            ) : certification.kind === 'pdf' && documentSrc ? (
              <div className="os-cert-viewer__pdf">
                <CertificatePreviewMedia
                  certification={{ ...certification, src: documentSrc }}
                  enlarge
                />
                <iframe
                  src={documentSrc}
                  title={`${certification.name} PDF certificate`}
                  className="os-cert-viewer__frame"
                />
              </div>
            ) : (
              <CertificatePreviewMedia certification={certification} enlarge />
            )}
          </div>

          <aside className="os-cert-viewer__aside">
            <h3>Credential record</h3>
            <dl>
              <div>
                <dt>Issuer</dt>
                <dd>{certification.issuer || 'Not published'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{status.label}</dd>
              </div>
              <div>
                <dt>Verification</dt>
                <dd>
                  {verification ? (
                    <a href={verification} target="_blank" rel="noreferrer noopener">
                      Open official verification <ExternalLink size={11} aria-hidden="true" />
                    </a>
                  ) : (
                    'No official verification link published'
                  )}
                </dd>
              </div>
            </dl>
            {certification.note ? <p className="os-cert-viewer__note">{certification.note}</p> : null}
            {!certification.documentVisible ? (
              <p className="os-cert-viewer__private">
                <ShieldCheck size={12} aria-hidden="true" /> Draft preview only. This document is not
                published until “Publish certificate document” is enabled and saved.
              </p>
            ) : null}
            {certification.redactions.length ? (
              <p className="os-cert-viewer__redactions">
                <ShieldCheck size={12} aria-hidden="true" />
                Redacted from this public copy: {certification.redactions.join(', ')}. Credential IDs
                and verification codes are never published.
              </p>
            ) : (
              <p className="os-cert-viewer__redactions">
                <ShieldCheck size={12} aria-hidden="true" />
                Credential IDs, verification codes and private identifiers are never published.
              </p>
            )}
            {hasViewerDocument && !documentSrc.startsWith('data:') ? (
              <a
                className="os-cert-viewer__open"
                href={documentSrc}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open the document in a new tab <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : null}
          </aside>
        </div>

        {count > 1 ? (
          <footer className="os-cert-viewer__nav">
            <button type="button" onClick={onPrevious} aria-label="Previous certificate" disabled={!onPrevious}>
              <ChevronLeft size={16} aria-hidden="true" />
              Previous
            </button>
            <button type="button" onClick={onNext} aria-label="Next certificate" disabled={!onNext}>
              Next
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function CertificationsView({
  tone = 'dark',
  items = publicCertifications,
  preview = false,
}: {
  tone?: 'dark' | 'light';
  items?: StudioCertification[];
  preview?: boolean;
}) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewable = items;
  const active = viewerIndex === null ? null : viewable[viewerIndex];

  return (
    <div className={`os-app os-certs os-certs--${tone}${tone === 'light' ? ' os-app--light' : ''}`}>
      <header className="os-certs__header">
        <div>
          <p className="os-certs__eyebrow">
            <Award size={13} aria-hidden="true" /> Salesforce certifications
          </p>
          <h1>Certifications and credentials.</h1>
          <p className="os-certs__lede">
            Owner-approved Salesforce certification names and their issuer. Certificate
            documents, dates and verification links are not published.
          </p>
        </div>
        <div className="os-certs__actions">
          <AppLink className="os-button os-button--quiet" href="/resume/">
            <FileText size={15} aria-hidden="true" />
            Open the résumé
          </AppLink>
          <AppLink className="os-button os-button--primary" href="/recruiter/">
            Recruiter Mode <ArrowRight size={14} aria-hidden="true" />
          </AppLink>
        </div>
      </header>

      <div className="os-certs__notice" role="note">
        <ShieldCheck size={16} aria-hidden="true" />
        <p>
          This gallery lists certification names and issuers only. Credential IDs, verification
          codes and private identifiers are not published. No claim of current validity or
          independent verification is made.
        </p>
      </div>

      {viewable.length === 0 ? (
        <p className="os-certs__empty">
          No certifications are currently public. The approved names remain in the local Content
          Studio draft.
        </p>
      ) : (
        <div className="os-certs__grid">
          {viewable.map((certification, index) => (
            <CertificationCard
              key={certification.id}
              certification={certification}
              priority={!preview && index < 2}
              onOpen={() => setViewerIndex(index)}
            />
          ))}
        </div>
      )}

      <footer className="os-certs__footer">
        <p>
          <Award size={13} aria-hidden="true" /> {viewable.length} public credential
          {viewable.length === 1 ? '' : 's'} · Salesforce certification names come from the approved
          professional record.
        </p>
        <AppLink className="os-text-link" href="/contact/">
          Ask about a credential <ArrowRight size={12} aria-hidden="true" />
        </AppLink>
      </footer>

      {active ? (
        <CertificateViewer
          certification={active}
          index={viewerIndex ?? 0}
          count={viewable.length}
          onClose={() => setViewerIndex(null)}
          onPrevious={
            viewerIndex !== null && viewerIndex > 0
              ? () => setViewerIndex((current) => (current === null ? null : current - 1))
              : undefined
          }
          onNext={
            viewerIndex !== null && viewerIndex < viewable.length - 1
              ? () => setViewerIndex((current) => (current === null ? null : current + 1))
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
