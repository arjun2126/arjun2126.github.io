import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { northgateLive, northgateLiveHome } from '../../src/content/northgateLive';

const root = process.cwd();

describe('Northgate live experience', () => {
  it('publishes only the verified buyer routes on the Experience Cloud origin', () => {
    expect(northgateLive.origin).toBe(
      'https://orgfarm-25065ad46a-dev-ed.develop.my.site.com',
    );
    expect(northgateLive.appBase).toBe(`${northgateLive.origin}/owners/s`);
    expect(northgateLiveHome.url).toBe(`${northgateLive.appBase}/buyer`);
    expect(northgateLive.views.map((view) => view.id)).toEqual([
      'home',
      'inventory',
      'studio',
      'about',
      'contact',
    ]);
    expect(northgateLive.views.map((view) => view.url)).toEqual([
      `${northgateLive.appBase}/buyer`,
      `${northgateLive.appBase}/buyer-inventory`,
      `${northgateLive.appBase}/buyer-studio`,
      `${northgateLive.appBase}/buyer-about`,
      `${northgateLive.appBase}/buyer-contact`,
    ]);
  });

  it('keeps the authenticated Owner Portal and login paths out of every link', () => {
    const serialized = JSON.stringify(northgateLive);
    expect(serialized).not.toContain('/owners/s/login');
    expect(serialized).not.toContain('c__view');
    for (const view of northgateLive.views) {
      expect(view.url).not.toMatch(/\/login|\/owners\/s\/?$/);
    }
  });

  it('records the framing block instead of claiming an interactive embed', () => {
    expect(northgateLive.framing.embeddable).toBe(false);
    expect(northgateLive.framing.xFrameOptions).toBe('SAMEORIGIN');
    expect(northgateLive.framing.csp).toBe("frame-ancestors 'self'");
    expect(northgateLive.proposal.toLowerCase()).toContain('owner');
    expect(northgateLive.proposal.toLowerCase()).toContain('approv');
  });

  it('ships every genuine preview capture referenced by the window', () => {
    for (const view of northgateLive.views) {
      for (const src of [view.src, view.thumb]) {
        const file = path.join(root, 'public', src.replace(/^\//, ''));
        expect(existsSync(file), `${src} should exist`).toBe(true);
        expect(statSync(file).size).toBeGreaterThan(1000);
      }
      expect(view.alt.length).toBeGreaterThan(20);
      expect(view.caption.length).toBeGreaterThan(30);
    }
  });
});
