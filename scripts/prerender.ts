/**
 * Generate route-specific static HTML after the Vite build.
 *
 * Each generated page contains the full public content as a styled,
 * no-JavaScript fallback, route-specific metadata and JSON-LD. The React app
 * replaces the fallback when JavaScript boots, so direct links, crawlers and
 * social previews do not depend on client rendering.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  extraProjects,
  featuredProjects,
  projects,
  projectBySlug,
  type Project,
} from '../src/content/projects';
import {
  allSkills,
  profile,
  resumeCapabilities,
  skillGroups,
} from '../src/content/profile';
import {
  certificationStatus,
  certificationVerification,
  hasPublicDocument,
  publicCertifications,
} from '../src/content/certifications';
import {
  aiCategories,
  experienceEntries,
  recruiter,
  salesforceTabs,
} from '../src/content/expertise';
import { northgateLive, northgateLiveHome } from '../src/content/northgateLive';
import { walkthrough } from '../src/content/walkthrough';
import { generatedDraft } from '../src/content/generated';
import { metaForRoute } from '../src/lib/meta';
import { RESUME_PDF_FILENAME, RESUME_PDF_PATH } from '../src/lib/resumeDocument';
import type { AppRoute, Route } from '../src/lib/router';

const root = process.cwd();
const dist = path.join(root, 'dist');
const siteUrl = (process.env.SITE_URL ?? 'https://arjun2126.github.io').replace(/\/+$/, '');
const reviewed = '2 November 2026';
const buildDate = new Date().toISOString().slice(0, 10);
const commit = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: root }).trim();
await writeFile(path.join(dist, 'deployment.json'), `${JSON.stringify({ commit, site: siteUrl })}\n`);

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const staticCss = await readFile(path.join(root, 'scripts', 'static-fallback.css'), 'utf8');

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function logo(): string {
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#e6edb3"/><path d="M10.5 28.5 20 9.5l9.5 19M15.2 22.6h9.6" fill="none" stroke="#0c2721" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function header(): string {
  return `<a class="st-skip" href="#st-main">Skip to content</a>
<header class="st-header">
  <a class="st-brand" href="/">${logo()}<span>ArjunOS</span></a>
  <nav aria-label="Portfolio">
    <a href="/">Home</a>
    <a href="/projects/">Projects</a>
    <a href="/recruiter/">Recruiter Mode</a>
    <a href="/salesforce/">Salesforce</a>
    <a href="/ai/">AI Engineering</a>
    <a href="/certifications/">Certifications</a>
    <a href="/resume/">Résumé</a>
    <a href="/skills/">Skills</a>
    <a href="/about/">About</a>
    <a href="/contact/">Contact</a>
  </nav>
</header>`;
}

function footer(): string {
  return `<footer class="st-footer">
  <p><strong>${escapeHtml(profile.name)}</strong> · ${escapeHtml(profile.disciplines)}</p>
  <p>Project documentation reviewed ${reviewed}. Professional details come from the owner-approved handoff. Private contact details and credential IDs are excluded.</p>
  <div class="st-footer__links">
    <a href="/">Projects</a>
    <a href="/certifications/">Certifications</a>
    <a href="/resume/">Résumé</a>
    <a href="/skills/">Skills</a>
    <a href="/about/">About</a>
    <a href="/contact/">Contact</a>
    <a href="${escapeHtml(profile.github)}" rel="noopener noreferrer">GitHub</a>
  </div>
  <p class="st-static-note">This is the static, no-JavaScript view of ArjunOS. The interactive desktop loads when JavaScript is available.</p>
</footer>`;
}

function tagList(items: string[]): string {
  return `<div class="st-tags">${items
    .map((item) => `<span class="st-tag">${escapeHtml(item)}</span>`)
    .join('')}</div>`;
}

function poster(project: Project): string {
  return `<div class="st-poster"><strong>${escapeHtml(project.mark)}</strong><span>${escapeHtml(project.name)} · typographic cover</span></div>`;
}

function projectCard(project: Project, priority = false): string {
  const image = project.cover.kind === 'image' && project.cover.src
    ? `<img src="${escapeHtml(project.cover.src)}" alt="${escapeHtml(project.cover.alt)}"${priority ? '' : ' loading="lazy"'} decoding="async" />`
    : poster(project);
  return `<a class="st-card" href="/projects/${project.slug}/">
  <div class="st-card-media">${image}</div>
  <div class="st-card-body">
    <p class="st-meta">${escapeHtml(project.category)} · ${escapeHtml(project.status)}</p>
    <h3>${escapeHtml(project.name)}</h3>
    <p>${escapeHtml(project.tagline)}</p>
    ${tagList(project.stack.slice(0, 3))}
  </div>
</a>`;
}

function listProjects(items: Project[]): string {
  return `<div class="st-list">${items
    .map(
      (project) => `<a href="/projects/${project.slug}/"><span><strong>${escapeHtml(project.name)}</strong><br /><span>${escapeHtml(project.tagline)}</span></span><span>${escapeHtml(project.category)}</span></a>`,
    )
    .join('')}</div>`;
}

function homePage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <section class="st-hero">
    <p class="st-kicker">Independent software portfolio</p>
    <h1>Hi, I’m <em>Arjun Subramanya.</em></h1>
    <p class="st-page-tagline">${escapeHtml(generatedDraft?.profile.headline || 'Salesforce Developer | Software Engineering | AI Automation')}</p>
    <p class="st-lede">I build Salesforce applications, native Apple experiences and AI-assisted engineering workflows — documented in public repositories, including what is still in progress.</p>
    <div class="st-actions">
      <a class="st-button st-button--primary" href="/projects/">Explore the desktop</a>
      <a class="st-button" href="/recruiter/">Recruiter Mode</a>
      <a class="st-button" href="/resume/">View the résumé</a>
    </div>
  </section>
  <section class="st-section" id="st-work">
    <h2>Selected work</h2>
    <div class="st-grid">${featuredProjects.map((project, index) => projectCard(project, index === 0)).join('')}</div>
  </section>
  <section class="st-section">
    <h2>More public work</h2>
    ${listProjects(extraProjects)}
  </section>
  <section class="st-section" id="st-certifications">
    <h2>Certifications</h2>
    <div class="st-grid">${publicCertifications.map((certification) => {
      const status = certificationStatus(certification);
      const verification = certificationVerification(certification);
      return `<div class="st-highlight">
        <p class="st-kicker">${escapeHtml(certification.issuer)}</p>
        <h3>${escapeHtml(certification.name)}</h3>
        <p class="st-meta">${escapeHtml(status.label)}</p>
        ${verification ? `<p><a class="st-link" href="${escapeHtml(verification)}" rel="noopener noreferrer">Official verification</a></p>` : '<p class="st-note">Verification link not published.</p>'}
      </div>`;
    }).join('')}</div>
    <div class="st-actions"><a class="st-button" href="/certifications/">Open the credential gallery</a></div>
    <p class="st-note">Credential IDs and verification codes are never published. An unpublished date does not imply an active credential.</p>
  </section>
  <section class="st-section">
    <h2>A profile built from evidence</h2>
    <p class="st-copy">Salesforce, Apple platforms and analytics work, documented in public. The résumé is project-first: no employment timeline, certifications or proficiency scores are invented.</p>
    <div class="st-actions">
      <a class="st-button" href="/resume/">Open the résumé</a>
      <a class="st-button" href="/skills/">Explore the toolkit</a>
    </div>
    <p class="st-note">${escapeHtml(profile.sourceNote)}</p>
  </section>
  ${footer()}
</main>
</div>`;
}

function projectPage(project: Project): string {
  const nextIndex = projects.findIndex((entry) => entry.slug === project.slug);
  const next = projects[(nextIndex + 1) % projects.length];
  const hero = project.hero
    ? `<figure class="st-hero-image">
        <img src="${escapeHtml(project.hero.src)}" alt="${escapeHtml(project.hero.alt)}" decoding="async" />
        <figcaption>${escapeHtml(project.hero.caption)} · Source: public repository</figcaption>
      </figure>`
    : '';
  const gallery = project.gallery.length > 0
    ? `<section class="st-section">
        <h2>Inside the work</h2>
        <div class="st-gallery">${project.gallery
          .map(
            (image) => `<figure><img src="${escapeHtml(image.thumb ?? image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async" /><figcaption>${escapeHtml(image.caption)}</figcaption></figure>`,
          )
          .join('')}</div>
        <p class="st-note">${escapeHtml(project.galleryNote)}</p>
      </section>`
    : `<section class="st-section"><h2>Inside the work</h2><p class="st-copy">The public repository publishes no product screenshots. No reconstruction is presented as an authentic capture.</p></section>`;

  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <a class="st-link" href="/">← All projects</a>
    <p class="st-kicker" style="margin-top:18px">${escapeHtml(project.category)} · ${escapeHtml(project.status)}</p>
    <h1 class="st-page-title">${escapeHtml(project.name)}</h1>
    <p class="st-page-tagline">${escapeHtml(project.tagline)}</p>
    <p class="st-lede">${escapeHtml(project.summary)}</p>
    ${tagList(project.stack)}
    <div class="st-actions">
      <a class="st-button st-button--primary" href="${escapeHtml(project.repo)}" rel="noopener noreferrer">Read the repository</a>
      <a class="st-button" href="/resume/">Evidence-based résumé</a>
    </div>
    <p class="st-note">${escapeHtml(project.repoNote)}</p>
  </div>
  ${hero}
  <section class="st-section">
    <h2>What it demonstrates</h2>
    <div class="st-highlights">${project.highlights
      .map(
        (highlight) => `<div class="st-highlight"><h3>${escapeHtml(highlight.title)}</h3><p>${escapeHtml(highlight.body)}</p></div>`,
      )
      .join('')}</div>
  </section>
  <section class="st-section">
    <h2>Evidence from the source</h2>
    <div class="st-evidence">${project.evidence
      .map(
        (item) => `<div><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span><p>${escapeHtml(item.detail)}</p></div>`,
      )
      .join('')}</div>
    <p class="st-note">${escapeHtml(project.evidenceNote)}</p>
  </section>
  ${gallery}
  <section class="st-section">
    <div class="st-limitations">
      <h2>What this page does not claim</h2>
      <ul>${project.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </div>
  </section>
  <section class="st-section">
    <h2>Next project</h2>
    <a class="st-card" href="/projects/${next.slug}/">
      <div class="st-card-body">
        <p class="st-meta">${escapeHtml(next.category)}</p>
        <h3>${escapeHtml(next.name)}</h3>
        <p>${escapeHtml(next.tagline)}</p>
      </div>
    </a>
    <p class="st-note">${escapeHtml(project.repoNote)} <a class="st-link" href="${escapeHtml(project.repo)}" rel="noopener noreferrer">View source on GitHub</a></p>
  </section>
  ${footer()}
</main>
</div>`;
}

function professionalExperience(): string {
  return `<section class="st-section"><h2>Professional experience</h2>${recruiter.experience
    .map((entry) => `<div class="st-highlight"><h3>${escapeHtml(entry.title)}</h3><p class="st-meta">${escapeHtml(entry.meta)}</p><p>${escapeHtml(entry.body)}</p></div>`)
    .join('')}<p class="st-note">${escapeHtml(recruiter.note)}</p></section>`;
}

function credentials(): string {
  return `<section class="st-section"><h2>Education and certifications</h2><ul>${recruiter.education
    .map((entry) => `<li>${escapeHtml([entry.credential, entry.institution, entry.dates].filter(Boolean).join(' · '))}</li>`)
    .join('')}</ul><ul>${recruiter.certifications.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`;
}

function resumePage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">Evidence-based profile</p>
    <h1 class="st-page-title">Résumé<em>.</em></h1>
    <p class="st-lede">Approved professional experience, education and certifications alongside independent project work. Private contact details and credential IDs remain excluded.</p>
    <div class="st-actions">
      <a class="st-button st-button--primary" href="${RESUME_PDF_PATH}" download="${RESUME_PDF_FILENAME}">Download résumé PDF</a>
      <a class="st-button" href="${escapeHtml(profile.github)}" rel="noopener noreferrer">GitHub profile</a>
      ${profile.resumePdf ? `<a class="st-button" href="${escapeHtml(profile.resumePdf)}" download="arjunos-resume.pdf">${escapeHtml(profile.resumePdfLabel)}</a>` : ''}
      <a class="st-button" href="/contact/">Contact routes</a>
    </div>
  </div>
  <section class="st-section">
    <h2>Profile</h2>
    <p class="st-copy">${escapeHtml(profile.summary)}</p>
    <p class="st-note">${escapeHtml(profile.resumeNote)}</p>
  </section>
  ${professionalExperience()}
  ${credentials()}
  <section class="st-section">
    <h2>Selected work</h2>
    ${listProjects(projects)}
  </section>
  <section class="st-section">
    <h2>Capabilities</h2>
    <div class="st-resume-grid">${resumeCapabilities
      .map(
        (group) => `<div class="st-resume-block"><h3>${escapeHtml(group.label)}</h3><ul>${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>`,
      )
      .join('')}</div>
    <p class="st-note">Skills are listed only where a public project uses them. No proficiency scores or years of experience are assigned.</p>
  </section>
  <section class="st-section">
    <h2>Contact</h2>
    <p class="st-copy">${escapeHtml(profile.contactIntro)}</p>
    <p class="st-note">${escapeHtml(profile.contactNote)}</p>
  </section>
  ${footer()}
</main>
</div>`;
}

function skillsPage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">Technical skills explorer</p>
    <h1 class="st-page-title">The toolkit<em>.</em></h1>
    <p class="st-lede">Every capability below is tied to a project that uses it. There are no proficiency percentages — just the work and the public source behind it.</p>
  </div>
  <section class="st-section">
    ${skillGroups
      .map(
        (group) => `<div class="st-skill-group">
          <h2>${escapeHtml(group.label)}</h2>
          <p>${escapeHtml(group.description)}</p>
          <div class="st-skill-row">${group.skills
            .map(
              (skill) =>
                skill.projects[0] ? `<a href="/projects/${skill.projects[0]}/">${escapeHtml(skill.name)}</a>` : `<span>${escapeHtml(skill.name)}</span>`,
            )
            .join('')}</div>
        </div>`,
      )
      .join('')}
    <p class="st-note">${allSkills.length} skills across ${skillGroups.length} disciplines. Each skill links to a project where it is used.</p>
  </section>
  ${footer()}
</main>
</div>`;
}

function aboutPage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">About</p>
    <h1 class="st-page-title">A portfolio that<br /><em>shows its work.</em></h1>
    <p class="st-lede">${escapeHtml(profile.intro)}</p>
  </div>
  <section class="st-section">
    <h2>How I work</h2>
    <div class="st-highlights">${profile.approach
      .map(
        (item) => `<div class="st-highlight"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></div>`,
      )
      .join('')}</div>
  </section>
  <section class="st-section">
    <h2>About ArjunOS</h2>
    <p class="st-copy">ArjunOS is a browsing device, not an operating-system emulator. The desktop allows several projects and documents to stay open at once; the mobile layout becomes a normal, scrollable document. Project pages are pre-rendered with their own metadata so they remain directly linkable and readable without the desktop.</p>
    <p class="st-copy" style="margin-top:12px">${escapeHtml(profile.resumeNote)}</p>
    <p class="st-note">${escapeHtml(profile.sourceNote)}</p>
  </section>
  ${footer()}
</main>
</div>`;
}

function contactPage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">Contact</p>
    <h1 class="st-page-title">Let’s talk about<br /><em>the work.</em></h1>
    <p class="st-lede">${escapeHtml(profile.contactIntro)}</p>
  </div>
  <section class="st-section">
    <h2>Primary route</h2>
    <p class="st-copy"><a class="st-link" href="${escapeHtml(profile.github)}" rel="noopener noreferrer">GitHub</a> · <a class="st-link" href="${escapeHtml(profile.linkedin)}" rel="noopener noreferrer">LinkedIn</a></p>
    <p class="st-note">${escapeHtml(profile.contactNote)}</p>
  </section>
  <section class="st-section">
    <h2>Public repositories</h2>
    <div class="st-list">${profile.repoList
      .map(
        (repo) => `<a href="${escapeHtml(repo.url)}" rel="noopener noreferrer"><strong>${escapeHtml(repo.name)}</strong><span>GitHub ↗</span></a>`,
      )
      .join('')}</div>
  </section>
  ${footer()}
</main>
</div>`;
}

function notFoundPage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <section class="st-notfound">
    <p class="st-kicker">404 · Route not found</p>
    <h1 class="st-page-title">That window doesn’t exist.</h1>
    <p class="st-lede" style="margin:0 auto 20px">This address is not part of ArjunOS. The project browser is still available.</p>
    <div class="st-actions">
      <a class="st-button st-button--primary" href="/">Back to projects</a>
      <a class="st-button" href="/resume/">View résumé</a>
    </div>
  </section>
  ${footer()}
</main>
</div>`;
}

function projectsPage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">Project index</p>
    <h1 class="st-page-title">All projects<em>.</em></h1>
    <p class="st-lede">Eight public repositories across Salesforce, Apple platforms, analytics and backend tooling. Every case study links back to its source and states what it does not claim.</p>
  </div>
  <section class="st-section">
    <div class="st-grid">${projects.map((project, index) => projectCard(project, index === 0)).join('')}</div>
  </section>
  ${footer()}
</main>
</div>`;
}

function recruiterPage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">Recruiter Mode · A streamlined view for hiring managers</p>
    <h1 class="st-page-title">${escapeHtml(recruiter.name)}</h1>
    <p class="st-page-tagline">${escapeHtml(recruiter.headline)}</p>
    <p class="st-lede">${escapeHtml(recruiter.summary)}</p>
    <div class="st-actions">
      <a class="st-button st-button--primary" href="${RESUME_PDF_PATH}" download="${RESUME_PDF_FILENAME}">Download résumé</a>
      <a class="st-button" href="/resume/">View résumé</a>
      <a class="st-button" href="/contact/">Contact Me</a>
    </div>
  </div>
  <section class="st-section">
    <h2>Professional summary</h2>
    <ul>${recruiter.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>
  </section>
  <section class="st-section">
    <h2>Experience</h2>
    ${recruiter.experience
      .map(
        (entry) => `<div class="st-highlight"><h3>${escapeHtml(entry.title)}</h3><p class="st-meta">${escapeHtml(entry.meta)}</p><p>${escapeHtml(entry.body)}</p></div>`,
      )
      .join('')}
    <p class="st-note">${escapeHtml(recruiter.note)}</p>
  </section>
  <section class="st-section">
    <h2>Skills</h2>
    ${recruiter.skills
      .map(
        (group) => `<div class="st-skill-group"><h3>${escapeHtml(group.label)}</h3><div class="st-skill-row">${group.items.map((item) => `<span class="st-tag">${escapeHtml(item)}</span>`).join('')}</div></div>`,
      )
      .join('')}
  </section>
  <section class="st-section">
    <h2>Featured projects</h2>
    <div class="st-grid">${featuredProjects.map((project) => projectCard(project)).join('')}</div>
  </section>
  ${footer()}
</main>
</div>`;
}

function salesforcePage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">Salesforce Workspace</p>
    <h1 class="st-page-title">Salesforce Development<em>.</em></h1>
    <p class="st-lede">Four public builds covering Experience Cloud, Apex, LWC, Flow, data modelling, security, architecture and deployment validation.</p>
    <p class="st-note">Independent simulations built on Salesforce. Not affiliated with or endorsed by Salesforce, Inc.</p>
  </div>
  ${salesforceTabs
    .map(
      (tab) => `<section class="st-section">
        <h2>${escapeHtml(tab.label)} · ${escapeHtml(tab.heading)}</h2>
        <p class="st-copy">${escapeHtml(tab.summary)}</p>
        <ul>${tab.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>
        <p class="st-note">${tab.projects.map((slug) => `<a class="st-link" href="/projects/${slug}/">${escapeHtml(projectBySlug[slug]?.name ?? slug)}</a>`).join(' · ')}</p>
      </section>`,
    )
    .join('')}
  ${footer()}
</main>
</div>`;
}

function aiPage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">AI Engineering</p>
    <h1 class="st-page-title">Agentic workflows,<br /><em>with guardrails.</em></h1>
    <p class="st-lede">Applied engineering practice and active experimentation with coding agents — not a claim of production machine-learning experience.</p>
  </div>
  ${aiCategories
    .map(
      (category) => `<section class="st-section">
        <h2>${escapeHtml(category.title)}</h2>
        <p class="st-copy">${escapeHtml(category.description)}</p>
        ${category.items
          .map(
            (item) => `<div class="st-highlight"><h3>${escapeHtml(item.name)} <span class="st-meta">· ${item.level}</span></h3><p>${escapeHtml(item.note)}</p></div>`,
          )
          .join('')}
      </section>`,
    )
    .join('')}
  <section class="st-section"><p class="st-note">Human approval gates: agents may draft and validate, but deployment, credentials and destructive changes require explicit owner approval.</p></section>
  ${footer()}
</main>
</div>`;
}

function experiencePage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">Experience</p>
    <h1 class="st-page-title">Experience, grounded<br /><em>in public work.</em></h1>
    <p class="st-lede">Approved professional experience and independent project work. Employment, education and certification names come from the owner-approved handoff; private details and credential IDs remain excluded.</p>
  </div>
  <section class="st-section">
    ${experienceEntries
      .map(
        (entry) => `<div class="st-highlight"><p class="st-meta">${escapeHtml(entry.period)}</p><h3>${escapeHtml(entry.title)}</h3><p class="st-meta">${escapeHtml(entry.org)}</p><p>${escapeHtml(entry.body)}</p></div>`,
      )
      .join('')}
  </section>
  ${footer()}
</main>
</div>`;
}

function certificationsPage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">Salesforce certifications</p>
    <h1 class="st-page-title">Certifications<br /><em>and credentials.</em></h1>
    <p class="st-lede">${publicCertifications.length} owner-approved Salesforce certification${publicCertifications.length === 1 ? '' : 's'} and their issuer. Certificate documents, dates and verification links are not published.</p>
    <div class="st-actions">
      <a class="st-button st-button--primary" href="/resume/">View the résumé</a>
      <a class="st-button" href="/recruiter/">Recruiter Mode</a>
    </div>
    <p class="st-note">Credential IDs, verification codes and private identifiers are not published. No claim of current validity or independent verification is made.</p>
  </div>
  <section class="st-section">
    <h2>Public credentials</h2>
    <div class="st-grid">${publicCertifications.length ? publicCertifications.map((certification) => {
      const status = certificationStatus(certification);
      const verification = certificationVerification(certification);
      const document = hasPublicDocument(certification)
        ? certification.kind === 'image'
          ? `<img src="${escapeHtml(certification.src)}" alt="${escapeHtml(certification.alt)}" loading="lazy" decoding="async" />`
          : `<p><a class="st-link" href="${escapeHtml(certification.src)}" rel="noopener noreferrer">Open the PDF certificate</a></p>`
        : certification.kind !== 'none'
          ? '<p class="st-note">Certificate document held privately.</p>'
          : '<p class="st-note">Certificate document not published.</p>';
      return `<article class="st-highlight">
        ${document}
        <p class="st-kicker">${escapeHtml(certification.issuer)}</p>
        <h3>${escapeHtml(certification.name)}</h3>
        <p class="st-meta">${escapeHtml(status.label)}</p>
        ${certification.note ? `<p>${escapeHtml(certification.note)}</p>` : ''}
        ${certification.redactions.length ? `<p class="st-note">Redacted from this public copy: ${escapeHtml(certification.redactions.join(', '))}.</p>` : ''}
        ${verification ? `<p><a class="st-link" href="${escapeHtml(verification)}" rel="noopener noreferrer">Official verification</a></p>` : '<p class="st-note">Official verification link not published.</p>'}
      </article>`;
    }).join('') : '<p class="st-copy">No certifications are currently public.</p>'}</div>
  </section>
  ${footer()}
</main>
</div>`;
}

function northgateLivePage(): string {
  return `<div class="st-shell">
${header()}
<main class="st-main" id="st-main">
  <div class="st-page-head">
    <p class="st-kicker">Live buyer experience</p>
    <h1 class="st-page-title">Northgate Motors,<br /><em>live.</em></h1>
    <p class="st-lede">The actual Salesforce Experience Cloud buyer site from the Northgate Motors demo org. Six guest routes, fictional inventory, no account required.</p>
    <p class="st-note"><strong>Embedded framing is blocked by Salesforce.</strong> The buyer site sends <code>X-Frame-Options: SAMEORIGIN</code> and <code>Content-Security-Policy: frame-ancestors 'self'</code>. This page therefore shows verified captures and links to the original site; it does not proxy or imitate the application. The authenticated Owner Portal is excluded.</p>
    <div class="st-actions">
      <a class="st-button st-button--primary" href="${northgateLiveHome.url}" target="_blank" rel="noreferrer noopener">Open the live buyer site</a>
      <a class="st-button" href="/projects/northgate-motors/">Read the case study</a>
    </div>
  </div>
  <section class="st-section">
    <h2>Verified public routes</h2>
    <div class="st-grid">
      ${northgateLive.views
        .map(
          (view) => `<figure class="st-highlight">
            <img src="${view.src}" alt="${escapeHtml(view.alt)}" loading="lazy" decoding="async" />
            <figcaption><h3>${escapeHtml(view.label)}</h3><p>${escapeHtml(view.caption)}</p><p class="st-meta">${escapeHtml(view.pathLabel)}</p><p><a class="st-link" href="${view.url}" target="_blank" rel="noreferrer noopener">Open this route</a></p></figcaption>
          </figure>`,
        )
        .join('')}
    </div>
  </section>
  <section class="st-section">
    <h2>Framing evidence</h2>
    <ul>
      <li><code>X-Frame-Options: ${northgateLive.framing.xFrameOptions}</code></li>
      <li><code>Content-Security-Policy: ${northgateLive.framing.csp}</code></li>
      <li>Checked <code>${northgateLive.framing.checkedUrl}</code> on ${northgateLive.verifiedAt}.</li>
      <li>${escapeHtml(northgateLive.proposal)}</li>
      <li>No Salesforce credentials, tokens, session details, private records or administrative functionality are exposed.</li>
    </ul>
  </section>
  ${footer()}
</main>
</div>`;
}

interface Page {
  route: Route;
  output: string;
  html: string;
  title?: string;
  description?: string;
  ogType?: 'website' | 'article';
  robots?: string;
  schema: unknown;
}

const homeRoute: Route = { kind: 'home', path: '/' };
const appRoute = (app: AppRoute, routePath: string): Route => ({
  kind: 'app',
  path: routePath,
  app,
});

const pages: Page[] = [
  {
    route: appRoute('walkthrough', '/walkthrough/'),
    output: 'walkthrough/index.html',
    html: `${header()}<main id="st-main" class="st-main"><h1>${escapeHtml(walkthrough.title)}</h1><p>${escapeHtml(walkthrough.summary)}</p>${walkthrough.supplied ? `<a href="${escapeHtml(walkthrough.externalUrl)}">Open approved recording</a>` : '<p>Recording not yet supplied. No simulated demonstration is shown.</p>'}${footer()}</main>`,
    schema: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Walkthrough — ArjunOS' },
  },
  {
    route: homeRoute,
    output: 'index.html',
    html: homePage(),
    title: 'Arjun Subramanya — Salesforce Developer & Software Engineer',
    ogType: 'website',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: 'Arjun Subramanya — ArjunOS',
      mainEntity: {
        '@type': 'Person',
        name: profile.name,
        sameAs: [profile.github, profile.x],
        knowsAbout: ['Salesforce', 'Apex', 'Lightning Web Components', 'Swift', 'watchOS', 'Python', 'Analytics'],
      },
    },
  },
  ...projects.map((project) => ({
    route: { kind: 'project', path: `/projects/${project.slug}/`, slug: project.slug } as Route,
    output: `projects/${project.slug}/index.html`,
    html: projectPage(project),
    ogType: 'article' as const,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.name,
      description: project.seoDescription,
      codeRepository: project.repo,
      genre: project.category,
      keywords: project.stack.join(', '),
      author: { '@type': 'Person', name: profile.name, sameAs: profile.github },
      isPartOf: { '@type': 'WebSite', name: 'ArjunOS' },
      ...(siteUrl ? { url: `${siteUrl}/projects/${project.slug}/` } : {}),
    },
  })),
  {
    route: appRoute('resume', '/resume/'),
    output: 'resume/index.html',
    html: resumePage(),
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: 'Résumé — Arjun Subramanya',
      mainEntity: { '@type': 'Person', name: profile.name, sameAs: [profile.github, profile.x] },
    },
  },
  {
    route: appRoute('skills', '/skills/'),
    output: 'skills/index.html',
    html: skillsPage(),
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Skills & Evidence — Arjun Subramanya',
      about: { '@type': 'Person', name: profile.name },
    },
  },
  {
    route: appRoute('about', '/about/'),
    output: 'about/index.html',
    html: aboutPage(),
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About — Arjun Subramanya',
      mainEntity: { '@type': 'Person', name: profile.name, sameAs: [profile.github, profile.x] },
    },
  },
  {
    route: appRoute('contact', '/contact/'),
    output: 'contact/index.html',
    html: contactPage(),
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact — Arjun Subramanya',
      mainEntity: { '@type': 'Person', name: profile.name, sameAs: [profile.github, profile.x] },
    },
  },
  {
    route: appRoute('projects', '/projects/'),
    output: 'projects/index.html',
    html: projectsPage(),
    title: 'Projects — Arjun Subramanya',
    description: 'Eight public repositories across Salesforce, Apple platforms, analytics and backend tooling.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Projects — Arjun Subramanya',
      hasPart: projects.map((project) => ({
        '@type': 'CreativeWork',
        name: project.name,
        url: siteUrl ? `${siteUrl}/projects/${project.slug}/` : `/projects/${project.slug}/`,
      })),
    },
  },
  {
    route: appRoute('recruiter', '/recruiter/'),
    output: 'recruiter/index.html',
    html: recruiterPage(),
    title: 'Recruiter Mode — Arjun Subramanya',
    description: 'A recruiter-focused overview of Salesforce development, software engineering and AI-assisted delivery.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: 'Recruiter Mode — Arjun Subramanya',
      mainEntity: { '@type': 'Person', name: profile.name, sameAs: [profile.github, profile.x] },
    },
  },
  {
    route: appRoute('salesforce', '/salesforce/'),
    output: 'salesforce/index.html',
    html: salesforcePage(),
    title: 'Salesforce Workspace — Arjun Subramanya',
    description: 'Salesforce development evidence across Apex, LWC, Flow, data modelling, security and deployment.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Salesforce Workspace — Arjun Subramanya',
      about: { '@type': 'Person', name: profile.name },
    },
  },
  {
    route: appRoute('live', '/northgate-live/'),
    output: 'northgate-live/index.html',
    html: northgateLivePage(),
    title: 'Northgate Live — Arjun Subramanya',
    description:
      'Explore the published Northgate Motors Salesforce Experience Cloud buyer site. Verified framing status, genuine captures, inventory and 3D Studio routes.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Northgate Live — Arjun Subramanya',
      about: {
        '@type': 'CreativeWork',
        name: 'Northgate Motors buyer experience',
        url: northgateLiveHome.url,
      },
      isPartOf: { '@type': 'WebSite', name: 'ArjunOS' },
    },
  },
  {
    route: appRoute('ai', '/ai/'),
    output: 'ai/index.html',
    html: aiPage(),
    title: 'AI Engineering — Arjun Subramanya',
    description: 'Applied AI engineering: agentic development, specification-driven harnesses, integrations and review practices.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'AI Engineering — Arjun Subramanya',
      about: { '@type': 'Person', name: profile.name },
    },
  },
  {
    route: appRoute('experience', '/experience/'),
    output: 'experience/index.html',
    html: experiencePage(),
    title: 'Experience — Arjun Subramanya',
    description: 'Project-based experience across Salesforce builds, native Apple development and analytics engineering.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Experience — Arjun Subramanya',
      about: { '@type': 'Person', name: profile.name },
    },
  },
  {
    route: appRoute('certifications', '/certifications/'),
    output: 'certifications/index.html',
    html: certificationsPage(),
    title: 'Certifications — Arjun Subramanya',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Certifications — Arjun Subramanya',
      hasPart: publicCertifications.map((certification) => ({
        '@type': 'EducationalOccupationalCredential',
        name: certification.name,
        credentialCategory: 'certification',
        recognizedBy: { '@type': 'Organization', name: certification.issuer },
        ...(certificationVerification(certification)
          ? { url: certificationVerification(certification) }
          : {}),
      })),
    },
  },
  {
    route: { kind: 'notfound', path: '/404/' },
    output: '404.html',
    html: notFoundPage(),
    title: 'Page not found — Arjun Subramanya',
    description: 'This ArjunOS route does not exist. Return to the project browser.',
    robots: 'noindex, follow',
    schema: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Page not found' },
  },
];

function headBlock(page: Page): string {
  const meta = metaForRoute(page.route);
  const title = page.title ?? meta.title;
  const description = page.description ?? meta.description;
  const canonical = siteUrl ? `${siteUrl}${page.route.path}` : '';
  const image = siteUrl ? `${siteUrl}/og/arjunos-cover.png` : '/og/arjunos-cover.png';
  const robots = page.robots ?? 'index, follow';
  const jsonLd = JSON.stringify(page.schema).replaceAll('<', '\\u003c');

  return `<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="author" content="${escapeHtml(profile.name)}" />
<meta name="robots" content="${robots}" />
${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : ''}
<meta property="og:type" content="${page.ogType ?? 'website'}" />
<meta property="og:site_name" content="ArjunOS" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="ArjunOS — Arjun Subramanya portfolio cover" />
${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}" />` : ''}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
<meta name="twitter:image:alt" content="ArjunOS — Arjun Subramanya portfolio cover" />
<script type="application/ld+json">${jsonLd}</script>
<style>${staticCss}</style>`;
}

function renderPage(page: Page): string {
  let html = template;
  html = html.replace(/\s*<meta\s+name="description"[^>]*\/?>/g, '');
  html = html.replace(/\s*<meta\s+(?:name|property)="(?:robots|og:[^"]+|twitter:[^"]+)"[^>]*\/?>/g, '');
  html = html.replace(/\s*<title>[\s\S]*?<\/title>/g, '');
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  html = html.replace('</head>', `${headBlock(page)}\n</head>`);
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${page.html}</div>`);
  return html;
}

for (const page of pages) {
  const outputPath = path.join(dist, page.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderPage(page), 'utf8');
  console.log(`prerendered /${page.output}`);
}

const notFoundCopy = path.join(dist, '404', 'index.html');
await mkdir(path.dirname(notFoundCopy), { recursive: true });
await writeFile(notFoundCopy, renderPage(pages[pages.length - 1]), 'utf8');

const protectedRoutes = [
  '/',
  '/projects/',
  '/recruiter/',
  '/salesforce/',
  '/ai/',
  '/experience/',
  '/certifications/',
  '/northgate-live/',
  '/walkthrough/',
  '/resume/',
  '/skills/',
  '/about/',
  '/contact/',
  ...projects.map((p) => `/projects/${p.slug}/`),
];
const sitemap = siteUrl
  ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${protectedRoutes
      .map(
        (route) =>
          `  <url><loc>${escapeHtml(siteUrl + route)}</loc><lastmod>${buildDate}</lastmod><changefreq>monthly</changefreq><priority>${route === '/' ? '1.0' : '0.8'}</priority></url>`,
      )
      .join('\n')}\n</urlset>\n`
  : null;

if (sitemap) {
  await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');
  console.log('wrote sitemap.xml');
} else {
  console.warn('SITE_URL not set — sitemap and absolute canonical URLs were not generated.');
}

const robots = `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`;
await writeFile(path.join(dist, 'robots.txt'), robots, 'utf8');

console.log(`prerender complete: ${pages.length} HTML routes, ${projects.length} project pages`);
console.log(`featured: ${featuredProjects.map((project) => project.slug).join(', ')}`);
console.log(`known project routes: ${Object.keys(projectBySlug).length}`);
