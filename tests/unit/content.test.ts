import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  categories,
  extraProjects,
  featuredProjects,
  projectBySlug,
  projects,
} from '../../src/content/projects';
import { allSkills, profile, skillGroups } from '../../src/content/profile';

const root = process.cwd();
const publicFile = (src: string) => path.join(root, 'public', src.replace(/^\//, ''));

function assertImage(src: string) {
  const file = publicFile(src);
  expect(existsSync(file), `${src} should exist`).toBe(true);
  expect(statSync(file).size, `${src} should not be empty`).toBeGreaterThan(1000);
}

describe('content registry', () => {
  it('has eight unique projects and four featured projects', () => {
    expect(projects).toHaveLength(8);
    expect(featuredProjects).toHaveLength(4);
    expect(extraProjects).toHaveLength(4);
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length);
    expect(new Set(projects.map((project) => project.name)).size).toBe(projects.length);
  });

  it('uses the required category filters', () => {
    expect(categories).toEqual(['All', 'Salesforce', 'Apple', 'Analytics', 'Backend']);
    for (const project of projects) {
      expect(categories).toContain(project.category);
    }
  });

  it('has complete, evidence-shaped content for every project', () => {
    for (const project of projects) {
      expect(project.summary.length).toBeGreaterThan(80);
      expect(project.stack.length).toBeGreaterThanOrEqual(3);
      expect(project.highlights.length).toBeGreaterThanOrEqual(3);
      expect(project.evidence.length).toBeGreaterThanOrEqual(3);
      expect(project.limitations.length).toBeGreaterThanOrEqual(3);
      expect(project.repo).toMatch(/^https:\/\/github\.com\/arjun2126\//);
      expect(project.repoNote.length).toBeGreaterThan(20);
      expect(project.evidenceNote.length).toBeGreaterThan(20);
      expect(project.cover.alt.length).toBeGreaterThan(20);
      expect(project.cover.caption.length).toBeGreaterThan(10);
      expect(project.seoDescription.length).toBeGreaterThan(60);
    }
  });

  it('ships every referenced image with meaningful text', () => {
    for (const project of projects) {
      if (project.cover.kind === 'image') {
        expect(project.cover.src).toBeTruthy();
        assertImage(project.cover.src!);
        if (project.cover.srcSmall) assertImage(project.cover.srcSmall);
      }
      if (project.hero) {
        assertImage(project.hero.src);
        expect(project.hero.alt.length).toBeGreaterThan(20);
        expect(project.hero.caption.length).toBeGreaterThan(10);
      }
      for (const image of project.gallery) {
        assertImage(image.src);
        if (image.thumb) assertImage(image.thumb);
        expect(image.alt.length).toBeGreaterThan(20);
        expect(image.caption.length).toBeGreaterThan(10);
      }
    }
  });

  it('does not substitute invented screenshots for missing captures', () => {
    const noShotSlugs = ['vantage', 'gotcare-ledger', 'revops-platform', 'tennis-lesson-planner', 'job-search-ops'];
    for (const slug of noShotSlugs) {
      const project = projectBySlug[slug];
      expect(project.cover.kind).toBe('typographic');
      expect(project.gallery).toHaveLength(0);
    }
    expect(projectBySlug['northgate-motors'].gallery.length).toBeGreaterThan(5);
    expect(projectBySlug['nova-grants'].gallery.length).toBeGreaterThan(2);
    expect(projectBySlug['care-operations-analytics'].gallery.length).toBeGreaterThan(3);
  });

  it('quotes sources and never includes a known private email address', () => {
    const content = readFileSync(path.join(root, 'src/content/projects.json'), 'utf8');
    expect(content).not.toMatch(/arjun_major@icloud\.com/i);
    expect(content).not.toMatch(/bailey_ins@icloud\.com/i);
    expect(content).not.toMatch(/password|api[_-]?key|private[_-]?key/i);
    for (const project of featuredProjects) {
      expect(project.repoNote.toLowerCase()).toContain('reviewed');
    }
  });

  it('has source documentation for every featured project', () => {
    const docs = [
      'northgate-motors-demo.md',
      'TennisScore.md',
      'nova-scotia-grants-salesforce.md',
      'care-operations-analytics.md',
    ];
    for (const file of docs) {
      const full = path.join(root, 'docs/sources', file);
      expect(existsSync(full), `${file} should exist`).toBe(true);
      expect(statSync(full).size).toBeGreaterThan(1000);
    }
  });
});

describe('profile and skills', () => {
  it('keeps the profile evidence-first and public', () => {
    expect(profile.github).toBe('https://github.com/arjun2126');
    expect(profile.resumeNote).toContain('owner-approved professional handoff');
    expect(profile.resumeNote).toContain('Credential IDs');
    expect(profile.contactNote).toContain('No public email');
    expect(profile.repoList).toHaveLength(projects.length);
    expect(new Set(profile.repoList.map((repo) => repo.url)).size).toBe(projects.length);
    expect(profile.repoList.map((repo) => repo.name).sort()).toEqual(projects.map((p) => p.name).sort());
  });

  it('links every skill to a real project', () => {
    expect(skillGroups).toHaveLength(5);
    expect(allSkills.length).toBeGreaterThanOrEqual(30);
    const slugs = new Set(projects.map((project) => project.slug));
    for (const group of skillGroups) {
      expect(group.skills.length).toBeGreaterThan(0);
      for (const skill of group.skills) {
        expect(skill.projects.length).toBeGreaterThan(0);
        for (const slug of skill.projects) {
          expect(slugs.has(slug), `${skill.name} references ${slug}`).toBe(true);
        }
        expect(skill.note.length).toBeGreaterThan(20);
      }
    }
  });
});
