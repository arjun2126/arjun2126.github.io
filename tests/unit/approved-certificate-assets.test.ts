import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import saved from '../../src/content/studio.generated.json';

// Exact owner-reviewed image bytes. No originals or credential values are used.
const approved = [
  ['salesforce-certified-administrator', '7d1e7be0fb79029106809d9910e8b31da7cbba2b995dd79fc03889568c4804ca'],
  ['salesforce-certified-platform-app-builder', '637975170e4dacaa980f311bea7ddca4864195387289b4ea7805ce5dca8a8b0b'],
  ['salesforce-certified-platform-developer-i', '8a607f99ebd0732717bec846d8aba9424249fe126764ed7e3730674239079c96'],
  ['salesforce-certified-agentforce-specialist', 'f30631dab396245371fadc486d84b48c40ca5e41b390db9c4a4d6b9851af047c'],
] as const;

describe('approved sanitized certificate assets', () => {
  it.each(approved)('publishes only the exact approved flattened WebP for %s', async (id, hash) => {
    const certification = saved.content.certifications.find(record => record.id === id)!;
    expect(certification).toBeDefined();
    expect(certification.kind).toBe('image');
    expect(certification.documentVisible).toBe(true);
    expect(certification.privateSrc).toBe('');
    expect(certification.src).toBe(`/media/certificate-${id}-${hash.slice(0, 24)}.webp`);
    expect(certification.issuedOn).toBe('');
    expect(certification.expiresOn).toBe('');
    expect(certification.verificationUrl).toBe('');
    expect(certification.verificationLabel).toBe('');
    const bytes = readFileSync(`public${certification.src}`);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(hash);
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    const chunks: string[] = [];
    for (let offset = 12; offset < bytes.length;) {
      chunks.push(bytes.subarray(offset, offset + 4).toString());
      const size = bytes.readUInt32LE(offset + 4);
      offset += 8 + size + (size % 2);
    }
    expect(chunks).toEqual(['VP8L']);
    const metadata = await sharp(bytes).metadata();
    expect(metadata.width).toBe(3840);
    expect(metadata.height).toBe(2160);
    expect(metadata.exif).toBeUndefined();
    expect(metadata.xmp).toBeUndefined();
    expect(metadata.icc).toBeUndefined();
    expect(certification.alt.length).toBeGreaterThan(8);
  });
});
