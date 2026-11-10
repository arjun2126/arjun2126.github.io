/** Explicit hash approval prevents ignored uploads/drafts silently entering dist. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { APPROVED_CERTIFICATION_NAMES } from '../src/content/certifications';
import { validateContentDraft, type GeneratedContentFile } from '../src/lib/studioContent';

const manifestPath = 'publication-approved.json';
const generatedPath = 'src/content/studio.generated.json';
async function files(folder: string): Promise<string[]> {
  return (await Promise.all((await readdir(folder, { withFileTypes: true })).map((entry) => {
    const name = `${folder}/${entry.name}`;
    assert(!entry.isSymbolicLink(), `Publication symlink is forbidden: ${name}`);
    return entry.isDirectory() ? files(name) : [name];
  }))).flat().sort();
}
const candidates = [generatedPath, ...await files('public')];
const hashes: Record<string, string> = {};
for (const file of candidates) hashes[file] = createHash('sha256').update(await readFile(file)).digest('hex');
const args = process.argv.slice(2);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as { files: Record<string, string> };
if (args[0] === '--approve' && args[1] === '--owner-reviewed') {
  assert(args.length > 2, 'List the exact reviewed paths; no implicit approval of all files.');
  for (const file of args.slice(2)) {
    assert(Object.hasOwn(hashes, file), `Not a publication candidate: ${file}`);
    manifest.files[file] = hashes[file];
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log('Recorded hashes for explicitly reviewed paths. No staging, commit or push performed.');
}
for (const file of candidates) {
  assert.equal(hashes[file], manifest.files[file], `Unreviewed publication file: ${file}. Review first; see docs/CONTENT_UPDATES.md.`);
  assert(!/(?:^|\/)(?:\.env[^/]*|\.cloud-attachments|content-studio|history|backups|drafts|\.DS_Store)(?:\/|$)/i.test(file), `Private artifact in public output: ${file}`);
}
const generated = JSON.parse(await readFile(generatedPath, 'utf8')) as GeneratedContentFile;
if (generated.content) {
  assert.deepEqual(validateContentDraft(generated.content), [], 'Saved content is invalid');
  const content = generated.content;
  const certificationNames = new Set(content.certifications.map((item) => item.name));
  for (const approved of APPROVED_CERTIFICATION_NAMES) {
    assert(
      certificationNames.has(approved),
      `The approved certification was removed from the gallery: ${approved}`,
    );
  }
  for (const certification of content.certifications) {
    assert(
      certification.documentVisible || (!certification.src && !certification.privateSrc),
      'A private certificate document reference entered the committed content file',
    );
    assert(
      !certification.documentVisible || !certification.privateSrc,
      'A published certificate still carries a private document reference',
    );
  }
  const mediaRefs = [
    content.profile.photo,
    content.resume.pdf,
    ...content.media.map((item) => item.src),
    ...(content.certifications ?? []).map((item) => item.src),
  ];
  for (const file of candidates.filter((file) => file.startsWith('public/media/'))) {
    const url = file.replace(/^public/, '');
    assert(mediaRefs.includes(url), `Orphaned media must be moved outside public before building: ${file}`);
  }
  const refs = mediaRefs.filter(Boolean);
  for (const ref of refs) {
    assert(/^\/media\/[\w.-]+\.(webp|pdf)$/.test(ref), `Unsaved/unsafe media reference: ${ref.slice(0, 80)}`);
    assert(Object.hasOwn(hashes, `public${ref}`), `Missing saved asset: ${ref}`);
  }
}
if (args.includes('--dist')) {
  const distFiles = await files('dist');
  for (const file of distFiles) {
    assert(!/\.(?:map|env|ts|tsx|log)$/.test(file), `Development file in dist: ${file}`);
    assert(!/(?:^|\/)(?:server|src|content-studio|history|backups|drafts|node_modules)(?:\/|$)/.test(file), `Private directory in dist: ${file}`);
    if (/\.(js|html|json|css|txt|xml)$/.test(file)) {
      const text = await readFile(file, 'utf8');
      assert(!text.includes('/__arjunos/content/'), `Write API reference in production: ${file}`);
      assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bsk-[A-Za-z0-9_-]{20,}|\/(?:Users|home)\/[A-Za-z0-9_.-]+\//.test(text), `Sensitive pattern in production: ${file}`);
    }
  }
  for (const file of candidates.filter((file) => file.startsWith('public/'))) {
    assert.equal(createHash('sha256').update(await readFile(path.join('dist', file.slice(7)))).digest('hex'), hashes[file], `Static asset changed in dist: ${file}`);
  }
}
console.log(`Publication verified: ${candidates.length} reviewed source/assets${args.includes('--dist') ? ' and static output' : ''}.`);
