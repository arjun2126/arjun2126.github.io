import { featuredProjects, projectBySlug } from './projects';
import { professional } from './professional';
import { generatedDraft } from './generated';

/**
 * Content for the ArjunOS desktop.
 *
 * Every claim here is derived from the public repositories documented in
 * docs/SOURCES.md. Where the source does not support a claim, the item is
 * labelled as planned, experimental, or omitted entirely.
 */

export interface Competency {
  id: 'salesforce' | 'apple' | 'ai' | 'analytics';
  title: string;
  icon: 'cloud' | 'phone' | 'cpu' | 'chart';
  blurb: string;
  items: string[];
  href: string;
  accent: string;
}

export const competencies: Competency[] = [
  {
    id: 'salesforce',
    title: 'Salesforce',
    icon: 'cloud',
    blurb: 'Platform engineering for operational workflows.',
    items: ['Apex', 'LWC', 'Flow', 'Experience Cloud', 'Integrations'],
    href: '/salesforce/',
    accent: '#4f8ef7',
  },
  {
    id: 'apple',
    title: 'App Development',
    icon: 'phone',
    blurb: 'Native Swift across phone and Watch.',
    items: ['Swift', 'iOS', 'watchOS', 'WidgetKit', 'ActivityKit'],
    href: '/projects/vantage/',
    accent: '#8b7cf6',
  },
  {
    id: 'ai',
    title: 'AI Engineering',
    icon: 'cpu',
    blurb: 'Agent harnesses with human review gates.',
    items: ['Agentic workflows', 'OpenCode', 'Codex', 'MCP', 'Harnesses'],
    href: '/ai/',
    accent: '#b07cf6',
  },
  {
    id: 'analytics',
    title: 'Data & Analytics',
    icon: 'chart',
    blurb: 'Pipelines and dashboards built on trust.',
    items: ['Python', 'SQL', 'Power BI', 'Tableau', 'Dashboards'],
    href: '/projects/care-operations-analytics/',
    accent: '#f0a35e',
  },
];

export const hero = {
  eyebrow: 'Independent software portfolio',
  greeting: "Hi, I'm",
  headline: generatedDraft?.profile.headline || 'Salesforce Developer · Software Engineering · AI Automation',
  intro:
    'I build and run Salesforce systems, analytics and native apps — with Apex and Lightning work when declarative tools run out. Every independent project below is documented in public.',
  primaryAction: { label: 'Explore the work', href: '/projects/' },
  secondaryAction: { label: 'Recruiter Mode', href: '/recruiter/' },
};

export interface RecruiterTab {
  id: 'overview' | 'experience' | 'skills' | 'projects' | 'credentials';
  label: string;
}

export const recruiterTabs: RecruiterTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'credentials', label: 'Credentials' },
];

const savedProfile = generatedDraft?.profile;
const savedCareer = generatedDraft?.career;

const siteExperience = professional.employment;

export const recruiter = {
  name: savedProfile?.name || professional.name,
  headline: savedProfile?.headline || professional.headline,
  summary: savedProfile?.summary || professional.shortPitch,
  location: professional.location,
  availability: professional.availability,
  linkedin: professional.linkedin,
  details: savedCareer ? [
    ...professional.employment.map((role) => `${role.title} · ${role.employer} · ${role.period}`),
    `${professional.certifications.length} reviewed certifications.`,
  ] : [
    'Business Systems Developer & Administrator at SWR, Waterloo Region (April 2025 – present).',
    'Three years at Uttara Infotech Solutions as a Junior Software Engineer & CRM Analyst.',
    'Four Salesforce certifications, including Administrator, Platform Developer I and Agentforce Specialist.',
  ],
  skills: generatedDraft?.skills.length
    ? generatedDraft.skills.map((group) => ({ label: group.label, items: group.items }))
    : [
        {
          label: 'Salesforce',
          items: ['Flow Builder', 'Apex', 'LWC', 'SOQL', 'Permissions', 'Reports & dashboards'],
        },
        {
          label: 'Business systems',
          items: ['Custom objects', 'Validation rules', 'Data migration', 'Sandbox → UAT → production'],
        },
        {
          label: 'Engineering',
          items: ['Python', 'SQL & PostgreSQL', 'Swift & SwiftUI', 'Automated tests'],
        },
        {
          label: 'AI workflow',
          items: ['Agent harnesses', 'MCP', 'Human approval gates'],
        },
      ],
  experience: siteExperience.map((role) => ({
    title: role.title,
    meta: [role.employer, role.period, role.location].filter(Boolean).join(' · '),
    body: role.summary,
  })),
  education: savedCareer?.education.length
    ? savedCareer.education.map((line) => ({
        credential: line,
        institution: '',
        location: '',
        focus: '',
        dates: '',
      }))
    : professional.education,
  certifications: savedCareer?.certifications.length
    ? savedCareer.certifications
    : professional.certifications,
  note: professional.note,
};

export interface SalesforceTab {
  id: string;
  label: string;
  heading: string;
  summary: string;
  bullets: string[];
  projects: string[];
}

export const salesforceTabs: SalesforceTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    heading: 'Salesforce Development Portfolio',
    summary:
      'Four public builds that exercise the platform the way operations teams use it: buyer journeys, grant adjudication, funding ledgers and configurable deal desks.',
    bullets: [
      'Experience Cloud buyer site with guest-safe Apex and page-mode routing.',
      'Grant intake with claim adjudication, funding guards and 41 deployed tests.',
      'Atomic claim approvals with idempotency and low-balance alerts.',
      'Metadata-driven discount rules validated before deployment.',
    ],
    projects: ['northgate-motors', 'nova-grants', 'gotcare-ledger', 'revops-platform'],
  },
  {
    id: 'apex-lwc',
    label: 'Apex & LWC',
    heading: 'Apex services, LWC surfaces',
    summary:
      'Server-side code is written for the boundary: DTOs for guest users, transactional services for approvals, and components that render real operational states.',
    bullets: [
      'Guest-safe data transfer objects and explicit portal isolation in Northgate Motors.',
      'Transactional claim approval with idempotency checks in Gotcare Ledger.',
      'Buyer site shell, budget dashboards and claim review surfaces in LWC.',
      '80 passing buyer contracts and documented component behaviour.',
    ],
    projects: ['northgate-motors', 'nova-grants', 'gotcare-ledger'],
  },
  {
    id: 'flow',
    label: 'Flow',
    heading: 'Flow with deliberate entry criteria',
    summary:
      'Flows handle the steps that should not live in code: intake, guided review, consent-gated automation and alerts that only cross a threshold once.',
    bullets: [
      'Screen Flows for grant intake and claim submission.',
      'Record-triggered low-balance alerts that fire only on a crossing.',
      'Consent-gated automation with explicit entry criteria.',
      'A draft Flow state preserved in the RevOps simulation for review.',
    ],
    projects: ['nova-grants', 'gotcare-ledger', 'revops-platform'],
  },
  {
    id: 'data-model',
    label: 'Data Model',
    heading: 'Objects shaped around the work',
    summary:
      'Custom objects, metadata and validation rules follow the operating model rather than the other way around, with reporting built on the same structure.',
    bullets: [
      'Custom objects for grants, claims, disbursements and capacity.',
      'Four custom objects for the funding ledger in Gotcare Ledger.',
      'Three custom metadata types driving RevOps pricing rules.',
      'Reports and native dashboard charts for oversight.',
    ],
    projects: ['nova-grants', 'gotcare-ledger', 'revops-platform'],
  },
  {
    id: 'security',
    label: 'Security',
    heading: 'Authorization as design',
    summary:
      'Guest access, permission sets and sharing are treated as product requirements — not a deployment afterthought.',
    bullets: [
      'Guest-safe DTOs and portal isolation verified in Northgate Motors.',
      'Permission sets scoped per application in Nova Grants and RevOps.',
      'Custom permissions gate sensitive actions.',
      'Privacy-first defaults: no public personal data in demos.',
    ],
    projects: ['northgate-motors', 'nova-grants', 'revops-platform'],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    heading: 'Small systems with clear seams',
    summary:
      'Each build separates experience, automation and data so that a change in one layer has a documented effect on the others.',
    bullets: [
      'Experience Cloud site separated from the service layer by DTO contracts.',
      'Metadata-driven rules keep pricing logic configurable in RevOps.',
      'Atomic approval services encapsulate ledger writes.',
      'Static contracts and documented limitations in every repository.',
    ],
    projects: ['northgate-motors', 'nova-grants', 'gotcare-ledger', 'revops-platform'],
  },
  {
    id: 'testing',
    label: 'Testing & Deployment',
    heading: 'Validate before you deploy',
    summary:
      'The repositories publish their test results and deployment checks, including the counts that are still incomplete.',
    bullets: [
      '41/41 deployed Apex tests passing in Nova Grants.',
      '80/80 buyer contracts passing in Northgate Motors.',
      '156 components validated with scoped manifests.',
      'Dry-run metadata validation before RevOps deployments.',
    ],
    projects: ['nova-grants', 'northgate-motors', 'revops-platform'],
  },
];

export type EvidenceLevel = 'applied' | 'experimental' | 'planned';

export interface AiCategory {
  id: string;
  title: string;
  description: string;
  items: Array<{ name: string; level: EvidenceLevel; note: string }>;
}

export const aiCategories: AiCategory[] = [
  {
    id: 'agentic',
    title: 'Agentic Development',
    description: 'Working alongside coding agents with a specification and a review gate.',
    items: [
      {
        name: 'OpenCode',
        level: 'applied',
        note: 'Used for implementation sessions against written specifications and persistent plans.',
      },
      {
        name: 'Codex',
        level: 'applied',
        note: 'Used for scoped code changes, review passes and documentation updates.',
      },
      {
        name: 'AI-assisted implementation',
        level: 'applied',
        note: 'This portfolio was built in plan → implement → test → review loops with an agent.',
      },
      {
        name: 'Workflow design',
        level: 'applied',
        note: 'Tasks decomposed into verifiable milestones with automated gates.',
      },
    ],
  },
  {
    id: 'harness',
    title: 'Agent Harness Engineering',
    description: 'The scaffolding that keeps an agent honest across sessions.',
    items: [
      {
        name: 'Specification-driven development',
        level: 'applied',
        note: 'AGENTS.md and PLANS.md define scope, acceptance criteria and prohibited actions.',
      },
      {
        name: 'Persistent planning',
        level: 'applied',
        note: 'PLANS.md and docs/PROGRESS.md carry decisions and validated checks between sessions.',
      },
      {
        name: 'Automated validation',
        level: 'applied',
        note: 'Type checks, unit tests, production build and browser journeys gate each change.',
      },
      {
        name: 'Review workflows',
        level: 'experimental',
        note: 'Independent review is requested where a reviewer exists; otherwise the limitation is documented.',
      },
    ],
  },
  {
    id: 'integrations',
    title: 'AI Integrations',
    description: 'Connecting models and tools without giving up control of the data.',
    items: [
      {
        name: 'MCP',
        level: 'experimental',
        note: 'Explored as a tool-connection protocol; no production MCP server is published.',
      },
      {
        name: 'Tool integrations',
        level: 'applied',
        note: 'Shell, browser, filesystem and test tools used inside bounded agent sessions.',
      },
      {
        name: 'API-based workflows',
        level: 'applied',
        note: 'OpenAI-compatible endpoints and local services kept server-side with owner keys.',
      },
      {
        name: 'Agent orchestration',
        level: 'experimental',
        note: 'Parallel research and review agents in development; not presented as production scale.',
      },
      {
        name: 'Agentforce assistant (prototype)',
        level: 'experimental',
        note: 'Configured prompt templates grounded in internal knowledge bases at SWR; a prototype, not a production agent.',
      },
    ],
  },
  {
    id: 'practice',
    title: 'AI Engineering Practices',
    description: 'The parts that make agent output usable rather than impressive.',
    items: [
      {
        name: 'Context management',
        level: 'applied',
        note: 'Small scoped tasks, recorded decisions and source registers that survive context loss.',
      },
      {
        name: 'Model evaluation',
        level: 'experimental',
        note: 'Outputs are reviewed against acceptance criteria; no benchmark suite is claimed.',
      },
      {
        name: 'Cost-conscious workflows',
        level: 'applied',
        note: 'Bounded iterations, local tooling and no paid service required to run this site.',
      },
      {
        name: 'Security & human approval',
        level: 'applied',
        note: 'No deployment, credential change or destructive action happens without owner approval.',
      },
    ],
  },
];

export const experienceEntries = siteExperience.map((role) => ({
  period: role.period || 'Dates not set',
  title: role.title,
  org: [role.employer, role.location].filter(Boolean).join(' · '),
  body: role.summary,
  responsibilities: role.responsibilities,
  projectSlugs: [] as string[],
}));

export const independentEntries = [
  {
    period: 'Public work · 2026',
    title: 'Independent software builder',
    org: 'Public repositories · github.com/arjun2126',
    body: 'Designed and shipped eight public projects across Salesforce, Swift, Python and analytics. Each repository documents its own architecture, tests and limitations.',
    projectSlugs: ['northgate-motors', 'nova-grants', 'gotcare-ledger', 'revops-platform'],
  },
  {
    period: 'Native app work',
    title: 'iOS & watchOS development',
    org: 'Vantage · TennisScore',
    body: 'Built a tennis scoring product across iPhone and Watch with a shared rating engine, widgets, Live Activities and HealthKit workout support.',
    projectSlugs: ['vantage'],
  },
  {
    period: 'Data & AI',
    title: 'Analytics and agentic tooling',
    org: 'Care Operations Analytics · Job Search Workflow',
    body: 'Built a validated analytics stack on synthetic data, and a local-only job-search CLI with a dry-run safety default and no scraping claim.',
    projectSlugs: ['care-operations-analytics', 'job-search-ops', 'tennis-lesson-planner'],
  },
];

export { professional };

export const competencyProjects = featuredProjects.map((project) => project.slug);

export function projectName(slug: string): string {
  return projectBySlug[slug]?.name ?? slug;
}
