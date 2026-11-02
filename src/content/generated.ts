import raw from './studio.generated.json';
import type { GeneratedContentFile } from '../lib/studioContent';

const file = raw as GeneratedContentFile;

/**
 * Local dev preview: the same draft the studio keeps in this browser is used
 * for rendering, so unsaved edits can be checked before they are written to
 * the build. It is never read during prerender or in a deployed build.
 */
function localPreviewDraft() {
  if (typeof window === 'undefined' || !import.meta.env?.DEV) return null;
  try {
    const rawDraft = window.localStorage.getItem('arjunos.content-studio.v1');
    if (!rawDraft) return null;
    const parsed = JSON.parse(rawDraft) as GeneratedContentFile['content'];
    return parsed?.profile?.name ? parsed : null;
  } catch {
    return null;
  }
}

/** Content saved from Content Studio, or the current local preview draft. */
export const generatedDraft = localPreviewDraft() ?? file.content;
export const generatedAt = file.updatedAt;
