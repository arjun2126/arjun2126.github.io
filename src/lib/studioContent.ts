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

export function validateContentDraft(draft: StudioDraft): string[] {
  const errors: string[] = [];
  const isImage = (src: string) => !src || /^\/media\/[\w.-]+\.webp$/.test(src) || /^data:image\/(?:png|jpe?g|webp);base64,[a-zA-Z0-9+/=\s]+$/.test(src);
  if (!isImage(draft.profile.photo)) errors.push('Portrait must be an uploaded PNG, JPEG or WebP.');
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
