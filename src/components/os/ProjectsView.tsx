import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, projects } from '../../content/projects';
import { emptyFilters, hasActiveFilters, searchProjects, type ProjectFilters } from '../../lib/search';
import { ProjectFilterBar } from '../ProjectFilterBar';
import { ProjectGridCard } from './parts';

export function ProjectsView() {
  const [filters, setFilters] = useState<ProjectFilters>(emptyFilters);
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => searchProjects(projects, filters), [filters]);
  const filtering = hasActiveFilters(filters);

  useEffect(() => {
    searchRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="os-projects">
      <header className="os-projects__header">
        <div>
          <p className="os-projects__eyebrow">Project index</p>
          <h1>All Projects</h1>
          <p className="os-projects__intro">
            Eight public repositories across Salesforce, Apple platforms, analytics and backend
            tooling. Each case study links back to its source and states what it does not claim.
          </p>
        </div>
        <div className="os-projects__stats" aria-hidden="true">
          <span>
            <strong>{projects.length}</strong> public
          </span>
          <span>
            <strong>{categories.length - 1}</strong> disciplines
          </span>
        </div>
      </header>

      <div className="os-projects__filters">
        <ProjectFilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          inputRef={searchRef}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="os-projects__empty">
          <span aria-hidden="true">∅</span>
          <h2>No projects match that.</h2>
          <p>Try a platform, a tool like “Apex”, or a phrase from the project’s evidence.</p>
          <button
            type="button"
            className="os-button os-button--primary"
            onClick={() => setFilters(emptyFilters)}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Clear filters
          </button>
        </div>
      ) : (
        <div className="os-projects__grid" data-project-count={filtered.length}>
          {filtered.map((project, index) => (
            <ProjectGridCard key={project.slug} project={project} priority={index < 3} />
          ))}
        </div>
      )}

      <footer className="os-projects__footer">
        <p>
          Facts and limitations are quoted from public repositories reviewed on 1 November 2026.
          Nothing is re-run or re-deployed for this portfolio.
        </p>
        <span>{filtering ? `${filtered.length} of ${projects.length} shown` : 'All public work'}</span>
      </footer>
    </div>
  );
}
