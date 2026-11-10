import {
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  EyeOff,
  ExternalLink,
  FileJson,
  FileText,
  ImagePlus,
  Lock,
  Play,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  certificateDraftDocument,
  certificationRecords,
  normalizeCertification,
} from '../../content/certifications';
import { profile, skillGroups } from '../../content/profile';
import { projects } from '../../content/projects';
import { professional } from '../../content/professional';
import { savedDraft } from '../../content/generated';
import {
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  classifyVideoUrl,
  pdfHasActiveContent,
  validateContentDraft,
  type StudioCareerEntry as CareerEntry,
  type StudioCertification as Certification,
  type StudioDraft as Draft,
  type StudioMediaItem as MediaItem,
} from '../../lib/studioContent';
import { isLocalEnvironment } from '../../lib/local';
import { CertificationCard, CertificateViewer } from './CertificationsView';
import { ImageRedactor } from './ImageRedactor';

type Section =
  | 'profile'
  | 'career'
  | 'certifications'
  | 'skills'
  | 'projects'
  | 'media'
  | 'resume'
  | 'walkthrough';

const STORAGE_KEY = 'arjunos.content-studio.v1';

function defaultDraft(): Draft {
  if (savedDraft) {
    const restored = structuredClone(savedDraft);
    // Older saves have no structured gallery. Start from the approved records
    // (including hidden ones) rather than showing an empty editor.
    restored.certifications = Array.isArray(restored.certifications)
      ? restored.certifications.map((entry, index) => normalizeCertification(entry, index))
      : certificationRecords.map((entry) => structuredClone(entry));
    restored.career = {
      ...restored.career,
      certifications: restored.certifications
        .filter((entry) => entry.visible && entry.name.trim())
        .map((entry) => entry.name),
    };
    return restored;
  }
  return {
    profile: {
      name: professional.name,
      headline: professional.headline,
      summary: professional.shortPitch,
      photo: profile.photo,
      github: professional.github,
      x: profile.x,
      linkedin: professional.linkedin,
      contactNote: profile.contactNote,
    },
    career: {
      experience: professional.employment.map((entry) => ({
        id: entry.id,
        period: entry.period,
        title: entry.title,
        org: `${entry.employer} · ${entry.location}`,
        body: entry.summary,
      })),
      education: professional.education.map(
        (entry) => `${entry.credential} — ${entry.institution}`,
      ),
      certifications: [...professional.certifications],
      achievements: [],
    },
    certifications: certificationRecords.map((entry) => structuredClone(entry)),
    skills: skillGroups.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.skills.map((skill) => skill.name),
    })),
    projects: projects.map((project) => ({
      slug: project.slug,
      name: project.name,
      tagline: project.tagline,
      summary: project.summary,
      stack: project.stack,
      repo: project.repo,
      link: project.link ?? '',
      linkLabel: project.linkLabel ?? '',
    })),
    media: [],
    resume: { pdf: profile.resumePdf, label: profile.resumePdf ? profile.resumePdfLabel : '' },
    walkthrough: { url: '', title: '', summary: '' },
    sources: [],
  };
}

function loadDraft(): Draft {
  if (typeof window === 'undefined') return defaultDraft();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDraft();
    const parsed = JSON.parse(raw) as Partial<Draft>;
    const base = defaultDraft();
    return {
      profile: { ...base.profile, ...parsed.profile },
      career: { ...base.career, ...parsed.career },
      skills: parsed.skills?.length ? parsed.skills : base.skills,
      projects: parsed.projects?.length
        ? base.projects.map((project) => {
            const saved = parsed.projects?.find((entry) => entry.slug === project.slug);
            return saved ? { ...project, ...saved } : project;
          })
        : base.projects,
      certifications: Array.isArray(parsed.certifications)
        ? parsed.certifications.map((entry, index) => normalizeCertification(entry, index))
        : base.certifications,
      media: parsed.media ?? base.media,
      resume: { ...base.resume, ...parsed.resume },
      walkthrough: { ...base.walkthrough, ...parsed.walkthrough },
      sources: parsed.sources ?? base.sources,
    };
  } catch {
    return defaultDraft();
  }
}

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function optimizeImage(
  file: File,
  maxSize: number,
  quality = 0.87,
  background?: string,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable.');
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // Re-encoding through canvas strips EXIF/GPS metadata from the owner's file.
  return canvas.toDataURL('image/jpeg', quality);
}

function readPdfFile(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      if (String.fromCharCode(...buffer.slice(0, 5)) !== '%PDF-') {
        reject(new Error('That file does not contain a valid PDF header.'));
        return;
      }
      let binary = '';
      const chunkSize = 0x8000;
      for (let offset = 0; offset < buffer.length; offset += chunkSize) {
        binary += String.fromCharCode(...buffer.subarray(offset, offset + chunkSize));
      }
      resolve(`data:application/pdf;base64,${window.btoa(binary)}`);
    } catch (error) {
      reject(error);
    }
  });
}

async function readDocxText(file: File): Promise<string> {
  const { unzipSync, strFromU8 } = await import('fflate');
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const documentXml = zip['word/document.xml'];
  if (!documentXml) throw new Error('This DOCX has no word/document.xml part.');
  return strFromU8(documentXml)
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function readFileDataUrl(file: File): Promise<string> {
  return optimizeImage(file, 1400, 0.9);
}

interface ImportCandidate {
  source: string;
  name?: string;
  headline?: string;
  summary?: string;
  notes: string[];
  unsupported?: string;
}

function parseResume(text: string, source: string): ImportCandidate {
  const candidate: ImportCandidate = { source, notes: [] };
  const trimmed = text.trim();

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      if (typeof parsed.name === 'string') candidate.name = parsed.name;
      if (typeof parsed.headline === 'string') candidate.headline = parsed.headline;
      if (typeof parsed.summary === 'string') candidate.summary = parsed.summary;
      candidate.notes.push('Parsed structured JSON.');
      return candidate;
    } catch {
      candidate.notes.push('The JSON could not be parsed; nothing was extracted.');
      return candidate;
    }
  }

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim());
  const heading = lines.find((line) => line.startsWith('# '));
  if (heading) candidate.name = heading.replace(/^#\s+/, '');
  const pipeLine = lines.find((line) => line.includes('|') && !line.startsWith('#'));
  if (pipeLine) candidate.headline = pipeLine;
  const paragraph = lines.find(
    (line) => line.length > 80 && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*'),
  );
  if (paragraph) candidate.summary = paragraph;
  candidate.notes.push(
    `${lines.filter((line) => line.length > 0).length} non-empty lines read. Only name, headline and summary are imported automatically.`,
  );
  return candidate;
}

const blankCareer: CareerEntry = { period: '', title: '', org: '', body: '' };

const blankCertification: Certification = {
  id: '',
  name: '',
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
  visible: false,
};

function withCertifications(draft: Draft, certifications: Certification[]): Draft {
  return {
    ...draft,
    certifications,
    // Keep the legacy name list in step for older import/export consumers.
    career: {
      ...draft.career,
      certifications: certifications
        .filter((certification) => certification.visible && certification.name.trim())
        .map((certification) => certification.name),
    },
  };
}

export function ContentStudio() {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [section, setSection] = useState<Section>('profile');
  const [status, setStatus] = useState('Draft loaded from this browser');
  const [pending, setPending] = useState<ImportCandidate | null>(null);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const [importError, setImportError] = useState('');
  const [projectSlug, setProjectSlug] = useState(projects[0].slug);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [certificationPreview, setCertificationPreview] = useState<Certification | null>(null);
  const [redactor, setRedactor] = useState<{ id: string; src: string; name: string } | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const mediaInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const local = isLocalEnvironment();

  useEffect(() => {
    if (!local) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setStatus(`Saved locally · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch {
      setStatus('Browser storage is full. Draft remains in memory; choose Save to project before closing or refreshing.');
    }
  }, [draft, local]);

  if (!local) {
    return (
      <div className="os-app os-studio os-studio--locked">
        <Lock size={26} aria-hidden="true" />
        <h1>Content Studio is local only</h1>
        <p>
          Editing is disabled on public hosts. Saving is available only on the local development server.
          Open the project locally with <code>npm run dev</code> to use it.
        </p>
        <a className="os-button os-button--primary" href="/">
          Back to the desktop
        </a>
      </div>
    );
  }

  const updateProfile = (key: keyof Draft['profile'], value: string) =>
    setDraft((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));

  const updateCareer = (index: number, key: keyof CareerEntry, value: string) =>
    setDraft((current) => ({
      ...current,
      career: {
        ...current.career,
        experience: current.career.experience.map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, [key]: value } : entry,
        ),
      },
    }));

  const updateSkill = (id: string, field: 'label' | 'items', value: string) =>
    setDraft((current) => ({
      ...current,
      skills: current.skills.map((group) =>
        group.id === id
          ? {
              ...group,
              [field]: field === 'items' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value,
            }
          : group,
      ),
    }));

  const updateProject = (
    slug: string,
    field: 'name' | 'tagline' | 'summary' | 'stack' | 'repo' | 'link' | 'linkLabel',
    value: string,
  ) =>
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.slug === slug
          ? {
              ...project,
              [field]: field === 'stack' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value,
            }
          : project,
      ),
    }));

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus('The profile photo must be an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setStatus('That image is larger than 8 MB; choose a smaller file.');
      return;
    }
    const src = await readFileDataUrl(file);
    setDraft((current) => ({ ...current, profile: { ...current.profile, photo: src } }));
    setStatus('Photo added to the local draft only.');
  };

  const onMedia = async (files: FileList | null) => {
    if (!files?.length) return;
    const next: MediaItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_IMAGE_BYTES) {
        setStatus(`${file.name} is larger than 8 MB and was skipped.`);
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        projectSlug,
        caption: file.name.replace(/\.[^.]+$/, ''),
        src: await readFileDataUrl(file),
        name: file.name,
      });
    }
    if (next.length) {
      setDraft((current) => ({ ...current, media: [...current.media, ...next] }));
      setStatus(`${next.length} image${next.length === 1 ? '' : 's'} added to the local draft.`);
    }
  };

  const onResumePdf = async (file: File | undefined) => {
    if (!file) return;
    setImportError('');
    if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
      setStatus('The downloadable résumé must be a PDF file.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setStatus(
        `That PDF is larger than ${Math.round(MAX_PDF_BYTES / 1_000_000)} MB; export a smaller, web-safe PDF.`,
      );
      return;
    }
    try {
      const pdf = await readPdfFile(file);
      setDraft((current) => ({
        ...current,
        resume: {
          ...current.resume,
          pdf,
          label: current.resume.label || 'Résumé — Arjun Subramanya (PDF)',
        },
      }));
      setStatus('PDF added to the draft. Review it for private details, then save to project.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'That PDF could not be read.');
    }
  };

  const onResume = async (file: File | undefined) => {
    if (!file) return;
    setImportError('');
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.pdf')) {
      setPending({
        source: file.name,
        notes: [
          'PDF text extraction is not part of this local build. The file was not uploaded or stored.',
          'Export the résumé as DOCX or Markdown and import that instead.',
        ],
        unsupported: 'PDF',
      });
      setSelectedFields({});
      return;
    }
    if (!/\.(md|markdown|txt|json|docx)$/.test(lower)) {
      setImportError('Use DOCX, Markdown, plain text or JSON. Other formats are not imported.');
      return;
    }
    try {
      const text = lower.endsWith('.docx') ? await readDocxText(file) : await readFileText(file);
      if (!text.trim()) throw new Error('No readable text was found in that document.');
      const candidate = parseResume(text, file.name);
      if (lower.endsWith('.docx')) {
        candidate.notes.unshift('DOCX text extracted locally; the original file was not uploaded.');
      }
      setPending(candidate);
      setSelectedFields({});
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'That file could not be read.');
    }
  };

  const applyImport = () => {
    if (!pending) return;
    setDraft((current) => ({
      ...current,
      profile: {
        ...current.profile,
        ...(selectedFields.name && pending.name ? { name: pending.name } : {}),
        ...(selectedFields.headline && pending.headline ? { headline: pending.headline } : {}),
        ...(selectedFields.summary && pending.summary ? { summary: pending.summary } : {}),
      },
      sources: [
        ...current.sources,
        {
          name: pending.source,
          kind: pending.unsupported ?? 'Markdown / text',
          importedAt: new Date().toISOString(),
          note: pending.unsupported
            ? 'Reference only; text not extracted in this build.'
            : 'Reviewed field changes applied to the local draft.',
        },
      ],
    }));
    setPending(null);
    setStatus('Reviewed import applied to the local draft.');
  };

  const exportDraft = () => {
    const payload = {
      ...draft,
      exportedAt: new Date().toISOString(),
      note: 'Local authoring draft. Review and copy approved fields into src/content before publishing.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'arjunos-content-draft.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('Exported arjunos-content-draft.json.');
  };

  const saveToProject = async () => {
    const errors = validateContentDraft(draft);
    if (errors.length) {
      setStatus(`Fix ${errors.length} validation issue${errors.length === 1 ? '' : 's'} before saving.`);
      return;
    }
    if (!import.meta.env.DEV) {
      setStatus('Save to project is available on the local dev server (npm run dev).');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/__arjunos/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        errors?: string[];
        updatedAt?: string;
        historyCount?: number;
        photo?: string;
        resumePdf?: string;
        mediaCount?: number;
        content?: Draft;
      };
      if (!response.ok || !result.ok) {
        throw new Error(result.errors?.join(' ') || 'The local save failed.');
      }
      setHistoryCount(result.historyCount ?? 0);
      setSavedAt(result.updatedAt ?? new Date().toISOString());
      if (result.photo !== undefined) {
        setDraft((current) => ({ ...current, profile: { ...current.profile, photo: result.photo! } }));
      }
      if (result.resumePdf !== undefined) {
        setDraft((current) => ({
          ...current,
          resume: { ...current.resume, pdf: result.resumePdf! },
        }));
      }
      if (result.content) setDraft(result.content);
      setStatus(
        `Saved to project${result.mediaCount ? ` with ${result.mediaCount} image${result.mediaCount === 1 ? '' : 's'}` : ''}. Review the diff, then run npm run publish:prepare.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The local save failed.');
    } finally {
      setSaving(false);
    }
  };

  const moveMedia = (id: string, direction: -1 | 1) =>
    setDraft((current) => {
      const index = current.media.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.media.length) return current;
      const media = [...current.media];
      [media[index], media[target]] = [media[target], media[index]];
      return { ...current, media };
    });

  const updateCertification = (id: string, patch: Partial<Certification>) =>
    setDraft((current) => {
      const next = current.certifications.map((certification) =>
        certification.id === id ? { ...certification, ...patch } : certification,
      );
      return withCertifications(current, next);
    });

  const replaceCertificateDocument = (
    id: string,
    kind: 'image' | 'pdf',
    src: string,
  ) =>
    setDraft((current) => {
      const next = current.certifications.map((certification) => {
        if (certification.id !== id) return certification;
        const replacing = Boolean(certification.src || certification.privateSrc);
        const name = certification.name.trim() || 'Certificate';
        const issuer = certification.issuer.trim() || 'the issuer';
        return {
          ...certification,
          kind,
          src: '',
          privateSrc: src,
          documentVisible: false,
          // A replacement must not inherit redaction claims from the old file.
          redactions: replacing ? [] : certification.redactions,
          alt:
            certification.alt ||
            `${name} certificate${kind === 'pdf' ? ' PDF' : ''} from ${issuer}.`,
        };
      });
      return withCertifications(current, next);
    });

  const moveCertification = (id: string, direction: -1 | 1) =>
    setDraft((current) => {
      const index = current.certifications.findIndex((certification) => certification.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.certifications.length) return current;
      const certifications = [...current.certifications];
      [certifications[index], certifications[target]] = [certifications[target], certifications[index]];
      return withCertifications(current, certifications);
    });

  const addCertification = () => {
    const id = crypto.randomUUID();
    setDraft((current) =>
      withCertifications(current, [
        ...current.certifications,
        { ...structuredClone(blankCertification), id },
      ]),
    );
  };

  const removeCertification = (id: string) => {
    const certification = draft.certifications.find((entry) => entry.id === id);
    if (!window.confirm(`Remove ${certification?.name || 'this certificate'} from the draft?`)) {
      return;
    }
    setDraft((current) =>
      withCertifications(
        current,
        current.certifications.filter((entry) => entry.id !== id),
      ),
    );
  };

  const onCertificateFile = async (id: string, file: File | undefined) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

    if (isPdf) {
      if (file.size > MAX_PDF_BYTES) {
        setStatus(`That PDF is larger than ${Math.round(MAX_PDF_BYTES / 1_000_000)} MB; export a smaller public copy.`);
        return;
      }
      try {
        const src = await readPdfFile(file);
        if (pdfHasActiveContent(window.atob(src.split(',')[1] ?? ''))) {
          setStatus('That PDF contains active content and was not added.');
          return;
        }
        replaceCertificateDocument(id, 'pdf', src);
        setStatus('Certificate PDF added to the local draft and held privately. Review it, then opt the document into publication.');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'That PDF could not be read.');
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      setStatus('Certificate documents must be a PNG, JPEG, WebP or PDF.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setStatus('That image is larger than 8 MB; choose a smaller public copy.');
      return;
    }
    try {
      const src = await optimizeImage(file, 1600, 0.9, '#ffffff');
      replaceCertificateDocument(id, 'image', src);
      setStatus('Certificate image added to the local draft and held privately. Review it, then opt the document into publication.');
    } catch {
      setStatus('That image could not be read.');
    }
  };

  const toggleDocumentVisibility = (certification: Certification) => {
    if (certification.documentVisible) {
      updateCertification(certification.id, {
        documentVisible: false,
        privateSrc: certification.src || certification.privateSrc,
        src: '',
      });
      return;
    }
    updateCertification(certification.id, {
      documentVisible: true,
      src: certification.privateSrc || certification.src,
      privateSrc: '',
    });
  };

  const applyRedaction = (dataUrl: string, count: number) => {
    if (!redactor) return;
    updateCertification(redactor.id, {
      kind: 'image',
      src: '',
      privateSrc: dataUrl,
      documentVisible: false,
      alt: draft.certifications.find((entry) => entry.id === redactor.id)?.alt || '',
    });
    setRedactor(null);
    setStatus(
      `Redacted public copy created with ${count} box${count === 1 ? '' : 'es'}. Review it, then opt the document into publication.`,
    );
  };

  const sections: Array<{ id: Section; label: string; hint: string }> = [
    { id: 'profile', label: 'Professional Profile', hint: 'Name, headline, bio, photo' },
    { id: 'career', label: 'Career', hint: 'Experience, education, awards' },
    { id: 'certifications', label: 'Certifications', hint: 'Credentials, documents, visibility' },
    { id: 'skills', label: 'Skills', hint: 'Grouped capabilities' },
    { id: 'projects', label: 'Projects', hint: 'Titles, copy, stack, links' },
    { id: 'media', label: 'Media', hint: 'Screenshots and ordering' },
    { id: 'resume', label: 'Résumé', hint: 'PDF download and import' },
    { id: 'walkthrough', label: 'Walkthrough', hint: 'Hosted video URL' },
  ];

  const conflicts = pending
    ? (['name', 'headline', 'summary'] as const).filter(
        (field) =>
          pending[field] &&
          draft.profile[field] &&
          pending[field]!.trim() !== draft.profile[field].trim(),
      )
    : [];

  const validationErrors = validateContentDraft(draft);

  return (
    <div className="os-app os-studio">
      <header className="os-studio__header">
        <div>
          <p className="os-studio__eyebrow">
            <Lock size={12} aria-hidden="true" /> Local only · never published
          </p>
          <h1>Content Studio</h1>
          <p className="os-studio__intro">
            Edit professional information, upload the real photograph, project screenshots and an
            approved résumé PDF, configure the hosted walkthrough, and import DOCX or Markdown.
            Changes stay local; saving writes validated content and media into this project so the
            next build, commit and deployment use them.
          </p>
        </div>
        <div className="os-studio__actions">
          <button type="button" className="os-button os-button--quiet" onClick={() => photoInput.current?.click()}>
            <ImagePlus size={15} aria-hidden="true" />
            Profile photo
          </button>
          <a className="os-button os-button--quiet" href="/" target="_blank" rel="noreferrer noopener">
            <ExternalLink size={15} aria-hidden="true" />
            Preview site
          </a>
          <button
            type="button"
            className="os-button os-button--primary"
            onClick={() => void saveToProject()}
            disabled={saving || validationErrors.length > 0 || !import.meta.env.DEV}
            title={
              !import.meta.env.DEV
                ? 'Run npm run dev to write content into the build'
                : validationErrors[0] ?? 'Validate and write this draft into the local build'
            }
          >
            <Save size={15} aria-hidden="true" />
            {saving ? 'Saving…' : 'Save to project'}
          </button>
          <button type="button" className="os-button os-button--quiet" onClick={exportDraft}>
            <Download size={15} aria-hidden="true" />
            Export draft
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            hidden
            aria-label="Upload profile photo"
            onChange={(event) => onPhoto(event.target.files?.[0])}
          />
        </div>
      </header>

      <div className="os-studio__body">
        <nav className="os-studio__nav" aria-label="Content sections">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`os-studio__nav-item${section === item.id ? ' is-active' : ''}`}
              aria-current={section === item.id ? 'true' : undefined}
              onClick={() => setSection(item.id)}
            >
              <span>{item.label}</span>
              <span>{item.hint}</span>
            </button>
          ))}
          <p className="os-studio__status" role="status" aria-live="polite">
            <Save size={13} aria-hidden="true" />
            {status}
          </p>
        </nav>

        <div className="os-studio__panel">
          {section === 'profile' ? (
            <div className="os-studio__form">
              <h2>Professional Profile</h2>
              <div className="os-studio__grid">
                <label>
                  Name
                  <input value={draft.profile.name} onChange={(event) => updateProfile('name', event.target.value)} />
                </label>
                <label>
                  Headline
                  <input
                    value={draft.profile.headline}
                    onChange={(event) => updateProfile('headline', event.target.value)}
                  />
                </label>
              </div>
              <label>
                Biography
                <textarea
                  rows={5}
                  value={draft.profile.summary}
                  onChange={(event) => updateProfile('summary', event.target.value)}
                />
              </label>
              <div className="os-studio__grid">
                <label>
                  GitHub URL
                  <input value={draft.profile.github} onChange={(event) => updateProfile('github', event.target.value)} />
                </label>
                <label>
                  X URL
                  <input value={draft.profile.x} onChange={(event) => updateProfile('x', event.target.value)} />
                </label>
                <label>
                  LinkedIn URL
                  <input
                    value={draft.profile.linkedin}
                    placeholder="Not yet provided"
                    onChange={(event) => updateProfile('linkedin', event.target.value)}
                  />
                </label>
              </div>
              <label>
                Contact note
                <textarea
                  rows={3}
                  value={draft.profile.contactNote}
                  onChange={(event) => updateProfile('contactNote', event.target.value)}
                />
              </label>
              <div className="os-studio__photo-row">
                <div className="os-studio__photo">
                  {draft.profile.photo ? (
                    <img src={draft.profile.photo} alt="Draft profile" />
                  ) : (
                    <span>No photo in draft</span>
                  )}
                </div>
                <div>
                  <p>
                    A portrait is only published after you approve it. Until then the site shows an
                    explicit placeholder, never a generated likeness.
                  </p>
                  <p className="os-studio__hint">
                    {draft.profile.photo.startsWith('/media/')
                      ? `Saved as ${draft.profile.photo} · commit it with the content change to publish.`
                      : 'Uploading keeps the image in this draft until you choose Save to project.'}
                  </p>
                  {draft.profile.photo ? (
                    <button
                      type="button"
                      className="os-studio__text-button"
                      onClick={() => updateProfile('photo', '')}
                    >
                      Remove photo from draft
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {section === 'career' ? (
            <div className="os-studio__form">
              <h2>Career</h2>
              <p className="os-studio__hint">
                Only add employment, education or certifications you can verify. Review all changes
                against your approved professional record before publication.
              </p>
              {draft.career.experience.map((entry, index) => (
                <fieldset key={index} className="os-studio__fieldset">
                  <legend>Professional experience {index + 1}</legend>
                  <div className="os-studio__grid">
                    <label>
                      Period
                      <input value={entry.period} onChange={(event) => updateCareer(index, 'period', event.target.value)} />
                    </label>
                    <label>
                      Title
                      <input value={entry.title} onChange={(event) => updateCareer(index, 'title', event.target.value)} />
                    </label>
                  </div>
                  <label>
                    Organisation
                    <input value={entry.org} onChange={(event) => updateCareer(index, 'org', event.target.value)} />
                  </label>
                  <label>
                    Description
                    <textarea rows={3} value={entry.body} onChange={(event) => updateCareer(index, 'body', event.target.value)} />
                  </label>
                  <button
                    type="button"
                    className="os-studio__text-button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        career: {
                          ...current.career,
                          experience: current.career.experience.filter((_, entryIndex) => entryIndex !== index),
                        },
                      }))
                    }
                  >
                    <Trash2 size={13} aria-hidden="true" /> Remove entry
                  </button>
                </fieldset>
              ))}
              <button
                type="button"
                className="os-button os-button--quiet"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    career: {
                      ...current.career,
                      experience: [...current.career.experience, { ...blankCareer, id: crypto.randomUUID() }],
                    },
                  }))
                }
              >
                Add experience entry
              </button>

              <label>
                Education (one per line)
                <textarea
                  rows={3}
                  value={draft.career.education.join('\n')}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      career: {
                        ...current.career,
                        education: event.target.value.split('\n'),
                      },
                    }))
                  }
                />
              </label>
              <p className="os-studio__hint">
                Certifications are managed in the <strong>Certifications</strong> section, where each
                credential keeps its issuer, dates, document, verification link and public
                visibility. Public names stay in sync with the résumé and generated PDF.
              </p>
              <label>
                Achievements (one per line)
                <textarea
                  rows={3}
                  value={draft.career.achievements.join('\n')}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      career: {
                        ...current.career,
                        achievements: event.target.value.split('\n'),
                      },
                    }))
                  }
                />
              </label>
            </div>
          ) : null}

          {section === 'certifications' ? (
            <div className="os-studio__form">
              <h2>Certifications</h2>
              <p className="os-studio__hint">
                Keep the four approved credentials, add only credentials you can verify, and attach
                a public copy with credential IDs, verification codes and private identifiers
                removed. Hiding an entry removes it from the homepage, Recruiter Mode, résumé and
                generated PDF without deleting the draft.
              </p>

              {draft.certifications.map((certification, index) => (
                <fieldset key={certification.id} className="os-studio__fieldset">
                  <legend>
                    {index + 1}. {certification.name || 'Untitled certificate'}
                    {certification.visible ? '' : ' · hidden'}
                  </legend>
                  <div className="os-studio__cert-actions">
                    <button
                      type="button"
                      onClick={() => moveCertification(certification.id, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${certification.name || 'certificate'} earlier`}
                    >
                      <ChevronUp size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCertification(certification.id, 1)}
                      disabled={index === draft.certifications.length - 1}
                      aria-label={`Move ${certification.name || 'certificate'} later`}
                    >
                      <ChevronDown size={14} aria-hidden="true" />
                    </button>
                    <label className="os-studio__toggle">
                      <input
                        type="checkbox"
                        checked={certification.visible}
                        aria-label={`Show ${certification.name || 'certificate'} publicly`}
                        onChange={(event) =>
                          updateCertification(certification.id, { visible: event.target.checked })
                        }
                      />
                      {certification.visible ? (
                        <Eye size={13} aria-hidden="true" />
                      ) : (
                        <EyeOff size={13} aria-hidden="true" />
                      )}
                      Publicly visible
                    </label>
                    <button
                      type="button"
                      className="os-studio__text-button"
                      onClick={() => setCertificationPreview(certification)}
                    >
                      <Eye size={13} aria-hidden="true" /> Preview
                    </button>
                    <button
                      type="button"
                      className="os-studio__text-button"
                      onClick={() => removeCertification(certification.id)}
                    >
                      <Trash2 size={13} aria-hidden="true" /> Remove
                    </button>
                  </div>

                  <div className="os-studio__grid">
                    <label>
                      Credential name
                      <input
                        value={certification.name}
                        onChange={(event) =>
                          updateCertification(certification.id, { name: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      Issuing organization
                      <input
                        value={certification.issuer}
                        onChange={(event) =>
                          updateCertification(certification.id, { issuer: event.target.value })
                        }
                      />
                    </label>
                  </div>

                  <div className="os-studio__grid">
                    <label>
                      Issue date (optional)
                      <input
                        type="date"
                        value={certification.issuedOn}
                        onChange={(event) =>
                          updateCertification(certification.id, { issuedOn: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      Expiry date (optional)
                      <input
                        type="date"
                        value={certification.expiresOn}
                        onChange={(event) =>
                          updateCertification(certification.id, { expiresOn: event.target.value })
                        }
                      />
                    </label>
                  </div>

                  <label>
                    Official verification URL (optional)
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                      value={certification.verificationUrl}
                      onChange={(event) =>
                        updateCertification(certification.id, {
                          verificationUrl: event.target.value,
                        })
                      }
                    />
                    <span className="os-studio__hint">
                      Link to the issuer's public verification page. Do not paste a URL containing a
                      credential ID or verification code.
                    </span>
                  </label>
                  <label>
                    Verification link label (optional)
                    <input
                      value={certification.verificationLabel}
                      placeholder="Verify with Salesforce"
                      onChange={(event) =>
                        updateCertification(certification.id, {
                          verificationLabel: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Public note (optional)
                    <textarea
                      rows={2}
                      value={certification.note}
                      placeholder="Describe only what the public record shows."
                      onChange={(event) =>
                        updateCertification(certification.id, { note: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Accessible description of the public copy (required with a document)
                    <textarea
                      rows={2}
                      value={certification.alt}
                      placeholder={`${certification.name || 'Certificate'} from ${certification.issuer || 'the issuer'}.`}
                      onChange={(event) =>
                        updateCertification(certification.id, { alt: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Redactions shown on the public copy (comma-separated labels only)
                    <input
                      value={certification.redactions.join(', ')}
                      placeholder="Credential ID, Verification code"
                      onChange={(event) =>
                        updateCertification(certification.id, {
                          redactions: event.target.value
                            .split(',')
                            .map((item) => item.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>

                  <div className="os-studio__cert-document">
                    <div className="os-studio__cert-thumb">
                      {certification.kind === 'image' &&
                      certificateDraftDocument(certification) ? (
                        <img src={certificateDraftDocument(certification)} alt="Draft certificate" />
                      ) : certification.kind === 'pdf' &&
                        certificateDraftDocument(certification) ? (
                        <>
                          <FileText size={24} aria-hidden="true" />
                          <span>PDF</span>
                        </>
                      ) : (
                        <>
                          <Award size={24} aria-hidden="true" />
                          <span>No document</span>
                        </>
                      )}
                    </div>
                    <div>
                      <p>
                        Use a public copy with credential IDs, verification codes and personal
                        details removed. Images are resized and re-encoded so EXIF metadata is
                        stripped; PDFs are stored as supplied, so export a sanitized PDF. Uploading
                        holds the document privately until you enable “Publish certificate
                        document” and save.
                      </p>
                      <label className="os-studio__upload">
                        <Upload size={15} aria-hidden="true" />
                        {certification.kind === 'none' ? 'Upload certificate image or PDF' : 'Replace document'}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,application/pdf,.pdf"
                          aria-label={`Upload certificate document for ${certification.name || 'new certificate'}`}
                          onChange={(event) => {
                            void onCertificateFile(certification.id, event.target.files?.[0]);
                            event.target.value = '';
                          }}
                        />
                      </label>
                      {certification.kind === 'image' &&
                      certificateDraftDocument(certification) ? (
                        <button
                          type="button"
                          className="os-button os-button--quiet"
                          onClick={() =>
                            setRedactor({
                              id: certification.id,
                              src: certificateDraftDocument(certification),
                              name: certification.name,
                            })
                          }
                        >
                          <ShieldCheck size={14} aria-hidden="true" /> Redact image
                        </button>
                      ) : null}
                      {certification.kind !== 'none' ? (
                        <label className="os-studio__toggle">
                          <input
                            type="checkbox"
                            checked={certification.documentVisible}
                            aria-label={`Publish certificate document for ${certification.name || 'new certificate'}`}
                            onChange={() => toggleDocumentVisibility(certification)}
                          />
                          {certification.documentVisible ? (
                            <Eye size={13} aria-hidden="true" />
                          ) : (
                            <EyeOff size={13} aria-hidden="true" />
                          )}
                          Publish certificate document
                        </label>
                      ) : null}
                      {certification.kind !== 'none' ? (
                        <button
                          type="button"
                          className="os-studio__text-button"
                          onClick={() =>
                            updateCertification(certification.id, {
                              kind: 'none',
                              src: '',
                              privateSrc: '',
                              documentVisible: false,
                              alt: '',
                            })
                          }
                        >
                          <Trash2 size={13} aria-hidden="true" /> Remove document
                        </button>
                      ) : null}
                      {certification.src.startsWith('/media/') ? (
                        <p className="os-studio__hint">
                          Published asset {certification.src} · commit it with the content change.
                        </p>
                      ) : null}
                      {certification.privateSrc.startsWith('/__arjunos/certificate-draft/') ? (
                        <p className="os-studio__hint">
                          Held in the local private folder and served only on loopback. It is stripped
                          from the committed content and the production bundle.
                        </p>
                      ) : null}
                      {certification.privateSrc.startsWith('data:') ? (
                        <p className="os-studio__hint">
                          Held in this browser draft only. Save to project to store it in the ignored
                          private folder.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </fieldset>
              ))}

              <button type="button" className="os-button os-button--quiet" onClick={addCertification}>
                <Award size={15} aria-hidden="true" /> Add certificate
              </button>

              <div className="os-studio__cert-preview">
                <h3>Preview before publication</h3>
                <p className="os-studio__hint">
                  This preview uses the current draft and does not publish anything. Hidden entries
                  are marked and stay out of the public build.
                </p>
                <div className="os-certs__grid os-certs__grid--studio">
                  {draft.certifications.map((certification) => (
                    <CertificationCard
                      key={certification.id}
                      certification={certification}
                      hidden={!certification.visible}
                      previewDocuments
                      onOpen={setCertificationPreview}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {section === 'skills' ? (
            <div className="os-studio__form">
              <h2>Skills</h2>
              <p className="os-studio__hint">
                Skills are published only where a public project supports them. Keep notes attached to
                the project rather than inventing proficiency levels.
              </p>
              {draft.skills.map((group) => (
                <fieldset key={group.id} className="os-studio__fieldset">
                  <legend>{group.label}</legend>
                  <label>
                    Group label
                    <input value={group.label} onChange={(event) => updateSkill(group.id, 'label', event.target.value)} />
                  </label>
                  <label>
                    Skills (comma separated)
                    <textarea
                      rows={3}
                      value={group.items.join(', ')}
                      onChange={(event) => updateSkill(group.id, 'items', event.target.value)}
                    />
                  </label>
                </fieldset>
              ))}
            </div>
          ) : null}

          {section === 'projects' ? (
            <div className="os-studio__form">
              <h2>Projects</h2>
              <label>
                Project
                <select value={projectSlug} onChange={(event) => setProjectSlug(event.target.value)}>
                  {projects.map((project) => (
                    <option key={project.slug} value={project.slug}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              {draft.projects
                .filter((project) => project.slug === projectSlug)
                .map((project) => (
                  <div key={project.slug} className="os-studio__stack">
                    <label>
                      Title
                      <input
                        value={project.name ?? ''}
                        placeholder={project.name}
                        onChange={(event) => updateProject(project.slug, 'name', event.target.value)}
                      />
                    </label>
                    <label>
                      Tagline
                      <input
                        value={project.tagline}
                        onChange={(event) => updateProject(project.slug, 'tagline', event.target.value)}
                      />
                    </label>
                    <label>
                      Summary
                      <textarea
                        rows={5}
                        value={project.summary}
                        onChange={(event) => updateProject(project.slug, 'summary', event.target.value)}
                      />
                    </label>
                    <label>
                      Stack (comma separated)
                      <input
                        value={project.stack.join(', ')}
                        onChange={(event) => updateProject(project.slug, 'stack', event.target.value)}
                      />
                    </label>
                    <div className="os-studio__grid">
                      <label>
                        Source repository URL
                        <input
                          value={project.repo ?? ''}
                          onChange={(event) => updateProject(project.slug, 'repo', event.target.value)}
                        />
                      </label>
                      <label>
                        Live project URL (optional)
                        <input
                          value={project.link ?? ''}
                          placeholder="https://"
                          onChange={(event) => updateProject(project.slug, 'link', event.target.value)}
                        />
                      </label>
                      <label>
                        Live link label
                        <input
                          value={project.linkLabel ?? ''}
                          placeholder="Open live project"
                          onChange={(event) => updateProject(project.slug, 'linkLabel', event.target.value)}
                        />
                      </label>
                    </div>
                    <p className="os-studio__hint">
                      Only publish links you have verified. The source revision and repository notes stay
                      with the reviewed source register.
                    </p>
                  </div>
                ))}
            </div>
          ) : null}

          {section === 'media' ? (
            <div className="os-studio__form">
              <h2>Media</h2>
              <p className="os-studio__hint">
                Upload genuine screenshots, edit captions and order them. The first image becomes the
                cover; existing verified gallery evidence is preserved. Save to project writes optimized
                WebP files to public/media/. Review these files before committing.
              </p>
              <div className="os-studio__grid">
                <label>
                  Project
                  <select value={projectSlug} onChange={(event) => setProjectSlug(event.target.value)}>
                    {projects.map((project) => (
                      <option key={project.slug} value={project.slug}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className="os-button os-button--quiet" onClick={() => mediaInput.current?.click()}>
                  <Upload size={15} aria-hidden="true" />
                  Add images
                </button>
                <input
                  ref={mediaInput}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  aria-label="Upload project images"
                  onChange={(event) => void onMedia(event.target.files)}
                />
              </div>
              {draft.media.length === 0 ? (
                <p className="os-studio__empty">
                  No media in the draft. Genuine Vantage screenshots can be added here once supplied.
                </p>
              ) : (
                <ul className="os-studio__media">
                  {draft.media.map((item, index) => (
                    <li key={item.id}>
                      <img src={item.src} alt="" />
                      <div>
                        <input
                          aria-label={`Caption for ${item.name}`}
                          value={item.caption}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              media: current.media.map((media) =>
                                media.id === item.id ? { ...media, caption: event.target.value } : media,
                              ),
                            }))
                          }
                        />
                        <select
                          aria-label={`Project for ${item.name}`}
                          value={item.projectSlug}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              media: current.media.map((media) =>
                                media.id === item.id ? { ...media, projectSlug: event.target.value } : media,
                              ),
                            }))
                          }
                        >
                          {projects.map((project) => (
                            <option key={project.slug} value={project.slug}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                        <div className="os-studio__media-actions">
                          <button type="button" onClick={() => moveMedia(item.id, -1)} disabled={index === 0} aria-label={`Move ${item.name} earlier`}>
                            <ChevronUp size={14} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMedia(item.id, 1)}
                            disabled={index === draft.media.length - 1}
                            aria-label={`Move ${item.name} later`}
                          >
                            <ChevronDown size={14} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                media: current.media.filter((media) => media.id !== item.id),
                              }))
                            }
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {section === 'resume' ? (
            <div className="os-studio__form">
              <h2>Résumé</h2>
              <p className="os-studio__hint">
                Upload only an approved, web-safe PDF. Remove phone, street address, credential IDs and
                other private details first. Uploading does not approve or publish a document.
              </p>
              <label className="os-studio__upload">
                Upload downloadable résumé PDF (maximum 6 MB)
                <input ref={pdfInput} type="file" accept="application/pdf,.pdf"
                  aria-label="Upload downloadable résumé PDF"
                  onChange={(event) => void onResumePdf(event.target.files?.[0])} />
              </label>
              <label>
                PDF download label
                <input value={draft.resume.label} onChange={(event) => setDraft((current) => ({
                  ...current, resume: { ...current.resume, label: event.target.value },
                }))} />
              </label>
              {draft.resume.pdf ? (
                <div className="os-studio__actions">
                  <a className="os-button" href={draft.resume.pdf} download="arjunos-resume.pdf">Download draft PDF for review</a>
                  <button className="os-button" type="button" onClick={() => setDraft((current) => ({
                    ...current, resume: { ...current.resume, pdf: '' },
                  }))}>Remove PDF</button>
                </div>
              ) : <p>No PDF supplied. The existing web résumé remains available.</p>}
              <p className="os-studio__hint">
                Import DOCX, Markdown, text or JSON. DOCX text is extracted in this browser; only
                reviewed fields are applied and every import is recorded with its source.
              </p>
              <label className="os-studio__upload">
                <FileText size={16} aria-hidden="true" />
                Import professional document
                <input
                  type="file"
                  accept=".md,.markdown,.txt,.json,.pdf,.docx"
                  onChange={(event) => void onResume(event.target.files?.[0])}
                />
              </label>

              {importError ? <p className="os-studio__error">{importError}</p> : null}

              {pending ? (
                <div className="os-studio__review">
                  <h3>Review import · {pending.source}</h3>
                  <ul className="os-studio__notes">
                    {pending.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                  {pending.unsupported ? (
                    <p className="os-studio__error">
                      {pending.unsupported} text extraction is not available locally. Nothing was
                      stored or changed.
                    </p>
                  ) : (
                    <>
                      {conflicts.length ? (
                        <p className="os-studio__warning">
                          {conflicts.length} field{conflicts.length === 1 ? '' : 's'} differ from the
                          published draft. Nothing changes until you select it.
                        </p>
                      ) : null}
                      <div className="os-studio__conflicts">
                        {(['name', 'headline', 'summary'] as const)
                          .filter((field) => pending[field])
                          .map((field) => (
                            <label key={field} className="os-studio__conflict">
                              <input
                                type="checkbox"
                                checked={Boolean(selectedFields[field])}
                                onChange={(event) =>
                                  setSelectedFields((current) => ({
                                    ...current,
                                    [field]: event.target.checked,
                                  }))
                                }
                              />
                              <span>
                                <strong>{field}</strong>
                                <span className="os-studio__current">Current: {draft.profile[field]}</span>
                                <span className="os-studio__next">Imported: {pending[field]}</span>
                              </span>
                            </label>
                          ))}
                      </div>
                    </>
                  )}
                  <div className="os-studio__review-actions">
                    <button
                      type="button"
                      className="os-button os-button--primary"
                      onClick={applyImport}
                      disabled={!Object.values(selectedFields).some(Boolean)}
                    >
                      Apply selected fields
                    </button>
                    <button type="button" className="os-button os-button--quiet" onClick={() => setPending(null)}>
                      Discard import
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="os-studio__sources">
                <h3>
                  <FileJson size={15} aria-hidden="true" /> Source references
                </h3>
                {draft.sources.length === 0 ? (
                  <p>No imports recorded yet.</p>
                ) : (
                  <ul>
                    {draft.sources.map((source) => (
                      <li key={`${source.name}-${source.importedAt}`}>
                        <strong>{source.name}</strong> · {source.kind} ·{' '}
                        {new Date(source.importedAt).toLocaleString()}
                        <span>{source.note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
          {section === 'walkthrough' ? (
            <div className="os-studio__form">
              <h2>Walkthrough</h2>
              <p className="os-studio__hint">Add only an approved recording of genuine applications. Leave empty until supplied. YouTube, Vimeo, Loom and direct HTTPS MP4/WebM URLs are supported.</p>
              {(['url', 'title', 'summary'] as const).map((field) => (
                <label key={field}>
                  {field === 'url' ? 'Hosted video URL' : field === 'title' ? 'Video title' : 'Video summary'}
                  <input value={draft.walkthrough[field]} onChange={(event) => setDraft((current) => ({
                    ...current, walkthrough: { ...current.walkthrough, [field]: event.target.value },
                  }))} />
                </label>
              ))}
              <p><Play size={16} aria-hidden="true" /> {draft.walkthrough.url ? `Player: ${classifyVideoUrl(draft.walkthrough.url).provider}` : 'No recording supplied. An honest placeholder will remain.'}</p>
              <a className="os-button" href="/walkthrough/" target="_blank" rel="noopener noreferrer">Preview walkthrough</a>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="os-studio__footer">
        <span>
          <Lock size={12} aria-hidden="true" /> Local draft only. Exporting does not publish.
        </span>
        <span className="os-studio__validation">
          <ShieldCheck size={12} aria-hidden="true" />
          {validationErrors.length === 0
            ? 'Validation passed'
            : `${validationErrors.length} issue${validationErrors.length === 1 ? '' : 's'}: ${validationErrors[0]}`}
          {savedAt ? ` · Last project save ${new Date(savedAt).toLocaleString()}` : ''}
          {historyCount ? ` · ${historyCount} backups retained` : ''}
        </span>
        <button
          type="button"
          className="os-text-button"
          onClick={() => {
            if (window.confirm('Reset the local draft to the published content?')) {
              window.localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }
          }}
        >
          <RotateCcw size={13} aria-hidden="true" /> Reset draft
        </button>
      </footer>

      {certificationPreview ? (
        <CertificateViewer
          certification={certificationPreview}
          index={0}
          count={1}
          allowPrivateDocument
          onClose={() => setCertificationPreview(null)}
        />
      ) : null}

      {redactor ? (
        <ImageRedactor
          src={redactor.src}
          name={redactor.name}
          onCancel={() => setRedactor(null)}
          onApply={applyRedaction}
        />
      ) : null}
    </div>
  );
}
