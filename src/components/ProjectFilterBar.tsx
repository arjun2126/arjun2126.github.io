import { Search, X } from 'lucide-react';
import type { RefObject } from 'react';
import { categories, type Category } from '../content/projects';
import { hasActiveFilters, type ProjectFilters } from '../lib/search';

export function ProjectFilterBar({
  filters,
  onChange,
  resultCount,
  inputRef,
  compact = false,
}: {
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
  resultCount: number;
  inputRef: RefObject<HTMLInputElement | null>;
  compact?: boolean;
}) {
  const active = hasActiveFilters(filters);

  return (
    <div className={`filter-bar${compact ? ' filter-bar--compact' : ''}`}>
      <div className="filter-bar__search">
        <Search size={17} aria-hidden="true" />
        <label className="sr-only" htmlFor="project-search">
          Search projects
        </label>
        <input
          ref={inputRef}
          id="project-search"
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search projects, stack or evidence"
          autoComplete="off"
          aria-describedby="project-result-count"
        />
        {filters.query ? (
          <button
            type="button"
            className="filter-bar__clear"
            onClick={() => onChange({ ...filters, query: '' })}
            aria-label="Clear project search"
          >
            <X size={15} aria-hidden="true" />
          </button>
        ) : (
          <kbd className="filter-bar__kbd" aria-hidden="true">
            ⌘K
          </kbd>
        )}
      </div>

      <div className="filter-bar__categories" role="group" aria-label="Filter by discipline">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-chip${filters.category === category ? ' is-active' : ''}`}
            aria-pressed={filters.category === category}
            onClick={() => onChange({ ...filters, category: category as Category | 'All' })}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="filter-bar__count" id="project-result-count" role="status" aria-live="polite">
        {active
          ? `${resultCount} ${resultCount === 1 ? 'project' : 'projects'} found`
          : `${resultCount} public projects`}
        {active ? (
          <button
            type="button"
            className="filter-bar__reset"
            onClick={() => onChange({ query: '', category: 'All' })}
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
