import raw from './studio.generated.json';
import type { GeneratedContentFile, StudioDraft } from '../lib/studioContent';

const file = raw as GeneratedContentFile;

/**
 * Normalise content saved by earlier Content Studio versions so a missing new
 * section never breaks a build. Unknown extra keys are preserved.
 */
function normalize(content: StudioDraft | null): StudioDraft | null {
  if (!content) return null;
  return {
    ...content,
    projects: (content.projects ?? []).map((project) => ({
      ...project,
      name: project.name ?? '',
      repo: project.repo ?? '',
      link: project.link ?? '',
      linkLabel: project.linkLabel ?? '',
    })),
    media: content.media ?? [],
    resume: content.resume ?? { pdf: '', label: '' },
    walkthrough: content.walkthrough ?? { url: '', title: '', summary: '' },
    sources: content.sources ?? [],
  };
}

/**
 * Local dev preview: the same draft the studio keeps in this browser is used
 * for rendering, so unsaved edits can be checked before they are written to
 * the build. It is never read during prerender or in a deployed build.
 */
function localPreviewDraft(): StudioDraft | null {
  if (typeof window === 'undefined' || !import.meta.env?.DEV) return null;
  try {
    const rawDraft = window.localStorage.getItem('arjunos.content-studio.v1');
    if (!rawDraft) return null;
    const parsed = JSON.parse(rawDraft) as StudioDraft;
    return parsed?.profile?.name ? normalize(parsed) : null;
  } catch {
    return null;
  }
}

/** Content saved from Content Studio, or the current local preview draft. */
export const savedDraft = normalize(file.content);
export const generatedDraft = localPreviewDraft() ?? savedDraft;
export const generatedAt = file.updatedAt;
