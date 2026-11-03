import raw from './projects.json';
import { generatedDraft } from './generated';

export type Category = 'Salesforce' | 'Apple' | 'Analytics' | 'Backend';
export type StatusTone = 'demo' | 'personal' | 'prototype';

export interface ProjectImage {
  src: string;
  thumb?: string;
  srcSmall?: string;
  alt: string;
  caption: string;
  tall?: boolean;
}

export interface Cover {
  kind: 'image' | 'typographic';
  src?: string;
  srcSmall?: string;
  alt: string;
  caption: string;
}

export interface Highlight {
  title: string;
  body: string;
}

export interface Evidence {
  value: string;
  label: string;
  detail: string;
}

export interface Project {
  slug: string;
  name: string;
  mark: string;
  category: Category;
  tags: Category[];
  featured: boolean;
  status: string;
  statusTone: StatusTone;
  tagline: string;
  summary: string;
  seoDescription: string;
  repo: string;
  repoRevision: string;
  repoNote: string;
  /** Optional owner-supplied live/demo link, separate from the source repository. */
  link?: string;
  linkLabel?: string;
  accent: string;
  accentSoft: string;
  cover: Cover;
  hero?: ProjectImage;
  stack: string[];
  highlights: Highlight[];
  evidence: Evidence[];
  evidenceNote: string;
  limitations: string[];
  gallery: ProjectImage[];
  galleryNote: string;
  seoImage: string;
}

interface ProjectFile {
  projects: Project[];
}

const baseProjects = (raw as ProjectFile).projects;
const savedProjects = new Map(
  (generatedDraft?.projects ?? []).map((project) => [project.slug, project]),
);
const savedMedia = generatedDraft?.media ?? [];

export const projects: Project[] = baseProjects.map((project) => {
  const copy = savedProjects.get(project.slug);
  const media = savedMedia.filter((item) => item.projectSlug === project.slug);
  const merged: Project = {
    ...project,
    ...(copy
      ? {
          ...(copy.name?.trim() ? { name: copy.name.trim() } : {}),
          tagline: copy.tagline,
          summary: copy.summary,
          stack: copy.stack,
          seoDescription: copy.summary,
          ...(copy.repo?.trim() ? { repo: copy.repo.trim() } : {}),
          ...(copy.link?.trim()
            ? { link: copy.link.trim(), linkLabel: copy.linkLabel?.trim() || 'Open live project' }
            : {}),
        }
      : {}),
  };
  if (media.length) {
    const [first] = media;
    merged.cover = {
      kind: 'image',
      src: first.src,
      alt: first.caption || `${project.name} screenshot`,
      caption: first.caption || project.cover.caption,
    };
    merged.gallery = [
      ...media.map((item) => ({
        src: item.src,
        alt: item.caption || `${project.name} screenshot`,
        caption: item.caption,
      })),
      ...project.gallery,
    ];
    merged.galleryNote = 'Owner-supplied screenshots from the local Content Studio.';
  }
  return merged;
});
export const featuredProjects = projects.filter((project) => project.featured);
export const extraProjects = projects.filter((project) => !project.featured);
export const categories: Array<Category | 'All'> = [
  'All',
  'Salesforce',
  'Apple',
  'Analytics',
  'Backend',
];

export const projectBySlug = Object.fromEntries(
  projects.map((project) => [project.slug, project]),
) as Record<string, Project>;

export const featuredSlugs = new Set(featuredProjects.map((project) => project.slug));

export function getProject(slug: string | undefined): Project | undefined {
  return slug ? projectBySlug[slug] : undefined;
}

export function projectHref(slug: string): string {
  return `/projects/${slug}/`;
}

export function projectStatusLabel(project: Project): string {
  return project.featured ? `Featured · ${project.category}` : `${project.category} · ${project.status}`;
}
