import { describe, expect, it } from 'vitest';
import { buildResumeHtml, escapeResumeHtml, RESUME_PDF_FILENAME, RESUME_PDF_PATH } from '../../src/lib/resumeDocument';
import { profile, resumeCapabilities } from '../../src/content/profile';
import { professional } from '../../src/content/professional';
import { projects } from '../../src/content/projects';

const html = buildResumeHtml({}, new Date('2026-11-04T00:00:00Z'));

describe('downloadable résumé', () => {
  it('is served from the résumé route under a safe filename', () => {
    expect(RESUME_PDF_PATH).toBe('/resume/arjun-subramanya-resume.pdf');
    expect(RESUME_PDF_FILENAME).toMatch(/^[A-Za-z0-9-]+\.pdf$/);
  });

  it('carries the approved profile, roles, duties and tools', () => {
    expect(html).toContain(escapeResumeHtml(profile.name));
    expect(html).toContain(escapeResumeHtml(profile.summary));
    expect(professional.employment.length).toBeGreaterThan(0);
    for (const role of professional.employment) {
      expect(html).toContain(escapeResumeHtml(role.title));
      expect(html).toContain(escapeResumeHtml(role.employer));
      expect(html).toContain(escapeResumeHtml(role.period));
      for (const duty of role.responsibilities.slice(0, 4)) expect(html).toContain(escapeResumeHtml(duty));
      for (const tool of role.technologies) expect(html).toContain(escapeResumeHtml(tool));
    }
  });

  it('carries education, certifications, capabilities and every project', () => {
    for (const entry of professional.education) {
      expect(html).toContain(escapeResumeHtml(entry.credential));
      expect(html).toContain(escapeResumeHtml(entry.institution));
    }
    for (const certification of professional.certifications) {
      expect(html).toContain(escapeResumeHtml(certification));
    }
    for (const group of resumeCapabilities) expect(html).toContain(escapeResumeHtml(group.label));
    expect(projects).toHaveLength(8);
    for (const project of projects) expect(html).toContain(escapeResumeHtml(project.name));
  });

  it('never carries private contact details or credential IDs', () => {
    expect(html).not.toMatch(/\b\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/);
    expect(html).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    expect(html).not.toMatch(/credential\s*id\s*[:#]/i);
    expect(html).not.toMatch(/content-studio|\.cloud-attachments|\/Users\//i);
    expect(html).toContain('linkedin.com/in/arjunsubra');
    expect(html).toContain('github.com/arjun2126');
  });
});
