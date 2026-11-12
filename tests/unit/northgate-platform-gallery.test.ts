import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import gallery from '../../src/content/northgate-platform-gallery.json';
import manifest from '../../docs/NORTHGATE_GALLERY_ASSETS.json';
import original from '../../src/content/projects.json';
import { getProject, projects } from '../../src/content/projects';

describe('Northgate Salesforce Platform gallery', () => {
  it('keeps the six README categories and all 21 distinct captures', () => {
    expect(gallery.sections.map(section => section.title)).toEqual([
      'Sales and delivery', 'Inventory and dealership locations', 'Financing and approvals',
      'Service operations', 'Loyalty data model', 'Reporting and dashboards',
    ]);
    expect(gallery.sections.map(section => section.images.length)).toEqual([7, 3, 3, 2, 3, 3]);
    const images = gallery.sections.flatMap(section => section.images);
    expect(images).toHaveLength(21);
    expect(new Set(images.map(image => image.src)).size).toBe(21);
    expect(getProject('northgate-motors')?.platformGallery).toEqual(gallery);
    expect(projects.filter(project => project.platformGallery)).toHaveLength(1);
    expect(gallery.note).toContain('not fresh functional, security or acceptance tests');
    expect(gallery.note).toContain('not live KPIs');
  });

  it('preserves the existing Northgate gallery, hero, cover and source evidence', () => {
    const before = original.projects.find(project => project.slug === 'northgate-motors')!;
    const current = getProject('northgate-motors')!;
    for (const key of ['gallery', 'galleryNote', 'hero', 'cover', 'evidence', 'limitations'] as const) {
      expect(current[key]).toEqual(before[key]);
    }
  });

  it.each(manifest.assets)('keeps exact sanitized source bytes and no inherited metadata: $path', async asset => {
    const bytes = readFileSync(asset.path);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
    expect(bytes.length).toBe(asset.bytes);
    expect(asset.source).toContain(`/${manifest.revision}/docs/screenshots/salesforce-platform/`);
    const metadata = await sharp(bytes).metadata();
    expect(metadata.format).toBe('jpeg');
    expect(metadata.width).toBeLessThanOrEqual(1600);
    expect(metadata.height).toBeLessThanOrEqual(1800);
    expect(metadata.exif).toBeUndefined();
    expect(metadata.xmp).toBeUndefined();
    expect(metadata.icc).toBeUndefined();
    expect(gallery.sections.flatMap(section => section.images).some(image => `public${image.src}` === asset.path)).toBe(true);
  });
});
