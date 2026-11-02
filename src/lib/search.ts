import type { Category, Project } from '../content/projects';

export interface ProjectFilters {
  query: string;
  category: Category | 'All';
}

export const emptyFilters: ProjectFilters = { query: '', category: 'All' };

function searchableText(project: Project): string {
  return [
    project.name,
    project.category,
    project.status,
    project.tagline,
    project.summary,
    project.stack.join(' '),
    project.highlights.map((item) => `${item.title} ${item.body}`).join(' '),
    project.evidence.map((item) => `${item.label} ${item.value} ${item.detail}`).join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

export function searchProjects(projects: Project[], filters: ProjectFilters): Project[] {
  const query = filters.query.trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);

  return projects.filter((project) => {
    if (filters.category !== 'All' && project.category !== filters.category) return false;
    if (terms.length === 0) return true;
    const haystack = searchableText(project);
    return terms.every((term) => haystack.includes(term));
  });
}

export function hasActiveFilters(filters: ProjectFilters): boolean {
  return filters.query.trim().length > 0 || filters.category !== 'All';
}
