import { describe, expect, it } from 'vitest';
import { projects } from '../../src/content/projects';
import { emptyFilters, hasActiveFilters, searchProjects } from '../../src/lib/search';

describe('project search and filter', () => {
  it('returns all projects with empty filters', () => {
    expect(searchProjects(projects, emptyFilters)).toHaveLength(projects.length);
    expect(hasActiveFilters(emptyFilters)).toBe(false);
  });

  it('filters by discipline', () => {
    const analytics = searchProjects(projects, { query: '', category: 'Analytics' });
    expect(analytics.map((project) => project.slug)).toEqual(['care-operations-analytics']);
    const apple = searchProjects(projects, { query: '', category: 'Apple' });
    expect(apple.map((project) => project.slug)).toEqual(['vantage']);
  });

  it('searches names, stacks, evidence and highlights', () => {
    expect(searchProjects(projects, { query: 'grants', category: 'All' }).map((p) => p.slug)).toContain(
      'nova-grants',
    );
    expect(searchProjects(projects, { query: 'glicko', category: 'All' }).map((p) => p.slug)).toEqual([
      'vantage',
    ]);
    expect(searchProjects(projects, { query: 'roc-auc', category: 'All' }).map((p) => p.slug)).toEqual([
      'care-operations-analytics',
    ]);
    expect(searchProjects(projects, { query: 'apex', category: 'All' }).length).toBeGreaterThanOrEqual(3);
  });

  it('requires every term to match', () => {
    const results = searchProjects(projects, { query: 'guest apex', category: 'All' });
    expect(results.map((project) => project.slug)).toEqual(['northgate-motors']);
    expect(searchProjects(projects, { query: 'guest tableau', category: 'All' })).toHaveLength(0);
  });

  it('is case-insensitive and combines query with category', () => {
    const results = searchProjects(projects, { query: 'SALESFORCE', category: 'Salesforce' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((project) => project.category === 'Salesforce')).toBe(true);
  });

  it('reports active filters', () => {
    expect(hasActiveFilters({ query: ' ', category: 'All' })).toBe(false);
    expect(hasActiveFilters({ query: 'apex', category: 'All' })).toBe(true);
    expect(hasActiveFilters({ query: '', category: 'Apple' })).toBe(true);
  });
});
