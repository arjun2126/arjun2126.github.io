import { describe, expect, it, vi } from 'vitest';
import { classifyVideoUrl, isHttpsUrl, validateContentDraft, type StudioDraft } from '../../src/lib/studioContent';

const draft = (): StudioDraft => ({
  profile: { name: 'Synthetic fixture', headline: 'Fixture', summary: 'Test only', photo: '', github: '', x: '', linkedin: '', contactNote: '' },
  career: { experience: [], education: [], certifications: [], achievements: [] },
  skills: [], projects: [], certifications: [], media: [], sources: [],
  resume: { pdf: '', label: '' }, walkthrough: { url: '', title: '', summary: '' },
});

describe('Content Studio publication validation', () => {
  it('keeps missing owner assets valid without inventing any', () => expect(validateContentDraft(draft())).toEqual([]));
  it.each(['javascript:alert(1)', 'http://example.test', 'https://name:password' + '@' + 'example.test', 'not a url'])(
    'rejects unsafe outbound URL %s', (url) => expect(isHttpsUrl(url)).toBe(false),
  );
  it('validates known video hosts and never embeds an arbitrary page', () => {
    expect(classifyVideoUrl('https://youtu.be/abcdefghijk').embedUrl).toBe('https://www.youtube-nocookie.com/embed/abcdefghijk');
    expect(classifyVideoUrl('https://www.youtube.com/watch?v=abcdefghijk').provider).toBe('youtube');
    expect(classifyVideoUrl('https://vimeo.com/123456789').embedUrl).toBe('https://player.vimeo.com/video/123456789');
    expect(classifyVideoUrl('https://example.test/video.mp4').provider).toBe('file');
    expect(classifyVideoUrl('https://youtube.com.evil.test/watch?v=abcdefghijk').embedUrl).toBeNull();
    expect(classifyVideoUrl('https://youtu.be/not-an-id').embedUrl).toBeNull();
    const content = draft();
    content.walkthrough.url = 'https://example.test/unreviewed-page';
    expect(validateContentDraft(content).length).toBeGreaterThan(0);
  });
  it('rejects media traversal, external images, duplicate IDs and external PDFs', () => {
    const content = draft();
    content.profile.photo = '/media/../private.webp';
    content.resume.pdf = 'https://example.test/private.pdf';
    content.media = [
      { id: 'same', projectSlug: 'vantage', caption: '', name: '', src: 'https://example.test/photo.webp' },
      { id: 'same', projectSlug: 'vantage', caption: '', name: '', src: '/media/image.webp' },
    ];
    expect(validateContentDraft(content).length).toBeGreaterThanOrEqual(4);
  });
  it('preserves structured career details when a stable role summary is edited', async () => {
    const original = (await import('../../src/content/professional')).professional;
    const content = draft();
    content.career.experience = original.employment.map((role) => ({ id: role.id, title: role.title, period: role.period, org: `${role.employer} · ${role.location}`, body: 'Updated reviewed summary' }));
    content.skills = [{ id: 'salesforce', label: 'Reviewed group', items: ['Updated fixture skill'] }];
    vi.resetModules();
    vi.doMock('../../src/content/generated', () => ({ generatedDraft: content }));
    const updated = (await import('../../src/content/professional')).professional;
    expect(updated.employment[0].summary).toBe('Updated reviewed summary');
    expect(updated.employment[0].responsibilities).toEqual(original.employment[0].responsibilities);
    expect(updated.employment[0].technologies).toEqual(original.employment[0].technologies);
    const profileModule = await import('../../src/content/profile');
    expect(profileModule.resumeCapabilities).toEqual([{ label: 'Reviewed group', items: ['Updated fixture skill'] }]);
    expect(profileModule.skillGroups[0].skills[0].name).toBe('Updated fixture skill');
    vi.doUnmock('../../src/content/generated');
    vi.resetModules();
  });
});
