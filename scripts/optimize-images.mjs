/**
 * Prepare source-authorized screenshots for the web.
 *
 * Originals live in docs/source-images (not shipped). Outputs are WebP at
 * readable widths. Nova Grants screenshots are cropped to remove the demo
 * account email bar that is unrelated to the product evidence.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicDir = path.join(root, 'public', 'projects');
const sourceRoot = path.join(root, '.freebuff', 'image-sources');

const repositorySources = {
  'northgate-motors-demo': {
    repo: 'northgate-motors-demo',
    branch: 'release/buyer-3-1',
    folder: 'docs/screenshots',
  },
  'nova-scotia-grants-salesforce': {
    repo: 'nova-scotia-grants-salesforce',
    branch: 'main',
    folder: 'docs/screenshots',
  },
  'care-operations-analytics': {
    repo: 'care-operations-analytics',
    branch: 'main',
    folder: 'dashboard/screenshots',
  },
};

const sources = {
  'northgate-motors-demo': {
    'home.webp': {
      source: 'home-1440.jpg',
      input: 'northgate-motors-demo/home-1440.jpg',
      alt: 'Northgate Motors buyer home page with a dark editorial header and orange coupe.',
    },
    'inventory.webp': {
      source: 'inventory-1440.jpg',
      input: 'northgate-motors-demo/inventory-1440.jpg',
    },
    'vehicle-detail.webp': {
      source: 'vehicle-detail-1440.jpg',
      input: 'northgate-motors-demo/vehicle-detail-1440.jpg',
    },
    'studio-3d.webp': {
      source: 'studio-3d-1440.jpg',
      input: 'northgate-motors-demo/studio-3d-1440.jpg',
    },
    'about.webp': { source: 'about-1440.jpg', input: 'northgate-motors-demo/about-1440.jpg' },
    'contact.webp': { source: 'contact-1440.jpg', input: 'northgate-motors-demo/contact-1440.jpg' },
    'mobile-home.webp': { source: 'home-390.jpg', input: 'northgate-motors-demo/home-390.jpg' },
    'mobile-inventory.webp': {
      source: 'inventory-390.jpg',
      input: 'northgate-motors-demo/inventory-390.jpg',
    },
    'mobile-studio.webp': {
      source: 'studio-3d-390.jpg',
      input: 'northgate-motors-demo/studio-3d-390.jpg',
    },
  },
  'nova-scotia-grants-salesforce': {
    'dashboard.webp': {
      source: 'executive-dashboard.png',
      input: 'nova-scotia-grants-salesforce/executive-dashboard.png',
      cropTop: 235,
    },
    'programs.webp': {
      source: 'nova-grants-app.png',
      input: 'nova-scotia-grants-salesforce/nova-grants-app.png',
      cropTop: 235,
    },
    'application.webp': {
      source: 'grant-application-flow.png',
      input: 'nova-scotia-grants-salesforce/grant-application-flow.png',
    },
    'claim.webp': {
      source: 'claim-processing.png',
      input: 'nova-scotia-grants-salesforce/claim-processing.png',
    },
    'ledger.webp': {
      source: 'financial-reports.png',
      input: 'nova-scotia-grants-salesforce/financial-reports.png',
    },
  },
  'care-operations-analytics': {
    'executive-overview.webp': {
      source: 'fixed-executive-overview.png',
      input: 'care-operations-analytics/fixed-executive-overview.png',
    },
    'funding-health.webp': {
      source: 'fixed-funding-health.png',
      input: 'care-operations-analytics/fixed-funding-health.png',
    },
    'operations.webp': {
      source: 'fixed-operations.png',
      input: 'care-operations-analytics/fixed-operations.png',
    },
    'exceptions.webp': {
      source: 'fixed-exceptions-risk.png',
      input: 'care-operations-analytics/fixed-exceptions-risk.png',
    },
    'powerbi-overview.webp': {
      source: 'care-portfolio-analytics-dashboard-overview.png',
      input: 'care-operations-analytics/care-portfolio-analytics-dashboard-overview.png',
    },
    'tableau-pulse.webp': {
      source: 'tableau-executive-pulse.png',
      input: 'care-operations-analytics/tableau-executive-pulse.png',
    },
  },
};

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

// Fetch the public original on demand. Originals are not committed because the
// Nova Grants captures include a demo-account email bar that is cropped out.
async function ensureSource(project, config) {
  const input = path.join(sourceRoot, config.input);
  if (await exists(input)) return input;
  const repository = repositorySources[project];
  if (!repository) throw new Error(`No repository source mapping for ${project}`);
  const url = `https://raw.githubusercontent.com/arjun2126/${repository.repo}/${repository.branch}/${repository.folder}/${config.source}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'ArjunOS-image-prep' } });
  if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);
  await fs.mkdir(path.dirname(input), { recursive: true });
  await fs.writeFile(input, Buffer.from(await response.arrayBuffer()));
  console.log(`downloaded source ${config.source}`);
  return input;
}

for (const [project, outputs] of Object.entries(sources)) {
  const outDir = path.join(publicDir, project);
  await fs.mkdir(outDir, { recursive: true });
  for (const [outputName, config] of Object.entries(outputs)) {
    const input = await ensureSource(project, config);
    let pipeline = sharp(input);
    const metadata = await pipeline.metadata();
    if (config.cropTop) {
      pipeline = sharp(input).extract({
        left: 0,
        top: config.cropTop,
        width: metadata.width,
        height: metadata.height - config.cropTop,
      });
    }
    const width = Math.min(metadata.width, config.cropTop ? 1600 : 1600);
    const output = path.join(outDir, outputName);
    await pipeline
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(output);
    const info = await sharp(output).metadata();
    const thumb = path.join(outDir, outputName.replace(/\.webp$/, '-800.webp'));
    await sharp(output)
      .resize({ width: Math.min(info.width, 800), withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(thumb);
    console.log(`${project}/${outputName} ${info.width}x${info.height}`);
  }
}

// A branded social card. No product screenshot is implied.
const ogDir = path.join(root, 'public', 'og');
await fs.mkdir(ogDir, { recursive: true });
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0c2622"/><stop offset="0.6" stop-color="#143b35"/><stop offset="1" stop-color="#1f4a40"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#dbe98d" stop-opacity="0.26"/><stop offset="1" stop-color="#dbe98d" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="#e6edb3" stroke-opacity="0.1" fill="none">
    <path d="M-50 520 C 180 420, 300 590, 520 500 S 900 380, 1260 500"/>
    <path d="M-50 570 C 200 470, 330 620, 560 550 S 920 440, 1260 560"/>
    <path d="M-50 620 C 220 530, 360 660, 600 590 S 960 500, 1260 610"/>
  </g>
  <rect x="64" y="62" width="54" height="54" rx="15" fill="#e6edb3"/>
  <text x="91" y="99" font-family="Georgia, serif" font-size="30" fill="#123a33" text-anchor="middle">A</text>
  <text x="136" y="99" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="3" fill="#f4f1e7">ARJUNOS</text>
  <text x="70" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="104" fill="#f7f3e8">Arjun</text>
  <text x="70" y="430" font-family="Georgia, 'Times New Roman', serif" font-size="104" font-style="italic" fill="#e6edb3">Subramanya</text>
  <text x="74" y="512" font-family="Helvetica, Arial, sans-serif" font-size="25" fill="#f7f3e8" opacity="0.82">Salesforce · Apple platforms · analytics</text>
  <text x="74" y="566" font-family="Helvetica, Arial, sans-serif" font-size="18" letter-spacing="4" fill="#e6edb3" opacity="0.8">SELECTED WORK, DOCUMENTED IN PUBLIC</text>
</svg>`;
await sharp(Buffer.from(ogSvg)).png().toFile(path.join(ogDir, 'arjunos-cover.png'));
console.log('public/og/arjunos-cover.png');

console.log('image optimization complete');
