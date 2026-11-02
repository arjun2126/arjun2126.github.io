export interface StudioCareerEntry {
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

export interface StudioDraft {
  profile: StudioProfile;
  career: {
    experience: StudioCareerEntry[];
    education: string[];
    certifications: string[];
    achievements: string[];
  };
  skills: Array<{ id: string; label: string; items: string[] }>;
  projects: Array<{ slug: string; tagline: string; summary: string; stack: string[] }>;
  media: StudioMediaItem[];
  sources: Array<{ name: string; kind: string; importedAt: string; note: string }>;
}

export interface GeneratedContentFile {
  version: 1;
  updatedAt: string | null;
  content: StudioDraft | null;
}

export function validateContentDraft(draft: StudioDraft): string[] {
  const errors: string[] = [];
  if (!draft.profile.name.trim()) errors.push('A professional name is required.');
  if (!draft.profile.headline.trim()) errors.push('A headline is required.');
  if (!draft.profile.summary.trim()) errors.push('A professional summary is required.');
  if (draft.profile.name.length > 120) errors.push('The name is longer than 120 characters.');
  if (draft.profile.headline.length > 240) errors.push('The headline is longer than 240 characters.');
  if (draft.profile.summary.length > 2000) errors.push('The summary is longer than 2,000 characters.');
  for (const url of [draft.profile.github, draft.profile.linkedin, draft.profile.x]) {
    if (url && !/^https:\/\//.test(url)) errors.push('Profile links must use https://.');
  }
  if (draft.career.experience.some((entry) => !entry.title.trim() || !entry.body.trim())) {
    errors.push('Every experience entry needs a title and description.');
  }
  if (draft.skills.some((group) => !group.label.trim())) errors.push('Skill groups need labels.');
  if (draft.projects.some((project) => !project.tagline.trim())) {
    errors.push('Every project needs a tagline.');
  }
  return errors;
}
