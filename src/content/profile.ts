import { generatedDraft } from './generated';

export interface Skill {
  name: string;
  projects: string[];
  note: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  short: string;
  description: string;
  skills: Skill[];
}

const saved = generatedDraft?.profile;

export const profile = {
  name: saved?.name?.trim() || 'Arjun Subramanya',
  handle: 'arjun2126',
  github: saved?.github || 'https://github.com/arjun2126',
  x: saved?.x || 'https://x.com/arjunsubramanya',
  /**
   * The published photograph. Leave empty until an approved image is supplied
   * through Content Studio; the desktop then renders an explicit placeholder
   * rather than a generated likeness.
   */
  photo: (saved?.photo ?? '') as string,
  photoAlt: 'Portrait of Arjun Subramanya',
  /**
   * The owner-approved, web-safe PDF résumé. Empty until a reviewed file is
   * uploaded through Content Studio; the site then offers a download action and
   * otherwise falls back to the printable web résumé.
   */
  resumePdf: (generatedDraft?.resume?.pdf ?? '') as string,
  resumePdfLabel:
    generatedDraft?.resume?.label?.trim() || 'Résumé — Arjun Subramanya (PDF)',
  linkedin: saved?.linkedin || 'https://www.linkedin.com/in/arjunsubra',
  location: 'Whitby, Ontario, Canada',
  availability: 'Open to Salesforce developer, administrator, and business-systems roles across Canada.',
  title: 'Salesforce developer & administrator',
  disciplines: 'Salesforce · business systems · analytics',
  headline: saved?.headline || 'Salesforce developer and administrator building systems that operations teams rely on.',
  intro: saved?.summary ||
    'I build and support Salesforce systems for operations teams: Flow automation, custom objects, permissions and reporting, plus Apex and Lightning components when configuration is not enough. I also work in Python, SQL and Swift.',
  shortIntro:
    'Salesforce systems, analytics and native apps — built end to end, with the sources attached.',
  summary:
    saved?.summary ||
    'I am a Salesforce developer and administrator with experience building business systems, analytics and AI-assisted workflows. My work covers Flow, Apex, Lightning Web Components, permissions and reporting, alongside Python, SQL and Swift.',
  approach: [
    {
      title: 'Show the source',
      body: 'Each featured project links to the repository it came from. Test counts, limitations and revision details are quoted from that source rather than estimated for the portfolio.',
    },
    {
      title: 'The unglamorous parts matter',
      body: 'Guest-safe data, idempotent payments, rollback paths, empty states and narrow-screen layouts are part of the product, not cleanup after it.',
    },
    {
      title: 'A demo is not production',
      body: 'Fictional data, mock integrations and future work are labelled. The line between a demonstration and a live system should be easy to see.',
    },
  ],
  resumeNote: generatedDraft?.resume.pdf
    ? 'This web résumé is the public version. It covers the roles, education and certifications approved for publication, plus a downloadable PDF. Private contact details and credential IDs are excluded.'
    : 'This web résumé is the public version. It covers the roles, education and certifications approved for publication. Phone numbers, email addresses, credential IDs and total-years figures are not included. A downloadable PDF is generated from this same approved content at build time.',
  contactIntro:
    'I am based in Whitby, Ontario and open to Salesforce developer, administrator and business-systems roles across Canada. LinkedIn and GitHub are the best ways to reach me.',
  contactNote:
    saved?.contactNote ||
    'No public email address or phone number is published. Contact goes through LinkedIn, GitHub or this page until email publication is approved.',
  sourceNote:
    'Project facts come from public repositories reviewed in November 2026. Professional details were supplied by Arjun and checked against the public record. Sources and caveats are recorded in docs/SOURCES.md.',
  repoList: [
    { name: 'Northgate Motors', url: 'https://github.com/arjun2126/northgate-motors-demo' },
    { name: 'Vantage', url: 'https://github.com/arjun2126/TennisScore' },
    { name: 'Nova Grants', url: 'https://github.com/arjun2126/nova-scotia-grants-salesforce' },
    {
      name: 'Care Operations Analytics',
      url: 'https://github.com/arjun2126/care-operations-analytics',
    },
    { name: 'Gotcare Care Ledger', url: 'https://github.com/arjun2126/Gotcare-Ledger' },
    { name: 'Configurable RevOps Platform', url: 'https://github.com/arjun2126/salesforce-revops-demo' },
    { name: 'Tennis Lesson Planner API', url: 'https://github.com/arjun2126/ai-engineering-journey' },
    {
      name: 'Agentic Job Search Workflow',
      url: 'https://github.com/arjun2126/agentic-job-search-workflow',
    },
  ],
};

const approvedSkillGroups: SkillGroup[] = [
  {
    id: 'salesforce',
    label: 'Salesforce platform',
    short: 'Salesforce',
    description:
      'Configuration, custom objects and code for operational workflows, with permissions and sharing treated as part of the design.',
    skills: [
      {
        name: 'Apex',
        projects: ['northgate-motors', 'nova-grants', 'gotcare-ledger'],
        note: 'Guest-safe DTOs, transactional approval services, funding guards and idempotency checks.',
      },
      {
        name: 'Lightning Web Components',
        projects: ['northgate-motors', 'gotcare-ledger'],
        note: 'Buyer site shell, budget dashboards and claim review surfaces with offline static contracts.',
      },
      {
        name: 'Experience Cloud',
        projects: ['northgate-motors'],
        note: 'A six-route public buyer site with guest permissions and page-mode routing.',
      },
      {
        name: 'Flow',
        projects: ['nova-grants', 'gotcare-ledger', 'revops-platform'],
        note: 'Screen Flows, record-triggered alerts and consent-gated automation with deliberate entry criteria.',
      },
      {
        name: 'Custom objects & metadata',
        projects: ['northgate-motors', 'nova-grants', 'gotcare-ledger', 'revops-platform'],
        note: 'Business models, custom metadata rules, validation rules and rollup-safe field design.',
      },
      {
        name: 'Permissions & sharing',
        projects: ['nova-grants', 'northgate-motors'],
        note: 'Permission sets, custom permissions, record sharing and guest-safe data access.',
      },
      {
        name: 'Reports & dashboards',
        projects: ['nova-grants', 'gotcare-ledger'],
        note: 'Four reports and four native dashboard charts for grant and funding oversight.',
      },
      {
        name: 'Salesforce DX',
        projects: ['northgate-motors', 'nova-grants', 'revops-platform'],
        note: 'Scoped manifests, metadata validation, deployment parity checks and source-driven workflows.',
      },
    ],
  },
  {
    id: 'apple',
    label: 'Apple platforms',
    short: 'Apple',
    description:
      'Native Swift work across iPhone, Apple Watch, widgets and Live Activities.',
    skills: [
      {
        name: 'Swift',
        projects: ['vantage'],
        note: 'Shared player models, scoring engines and Xcode target configuration across iOS and watchOS.',
      },
      {
        name: 'Swift concurrency',
        projects: ['vantage'],
        note: 'Concurrency is enabled across the Xcode project; shared state crosses phone and Watch targets.',
      },
      {
        name: 'watchOS',
        projects: ['vantage'],
        note: 'A companion app that mirrors matches, scores independently and starts a HealthKit workout.',
      },
      {
        name: 'WidgetKit',
        projects: ['vantage'],
        note: 'Next Match and This Week home-screen widgets plus Lock Screen accessories.',
      },
      {
        name: 'ActivityKit',
        projects: ['vantage'],
        note: 'A Live Activity that surfaces the active match, powered by shared match attributes.',
      },
      {
        name: 'HealthKit',
        projects: ['vantage'],
        note: 'A workout driven by the Watch companion during a live match.',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Data & analytics',
    short: 'Analytics',
    description:
      'Pipelines that validate data before visualization, with dashboards built around decisions.',
    skills: [
      {
        name: 'Python',
        projects: ['care-operations-analytics', 'tennis-lesson-planner', 'job-search-ops'],
        note: 'ETL, synthetic data generation, API services and local command-line tooling.',
      },
      {
        name: 'pandas',
        projects: ['care-operations-analytics'],
        note: 'Cleaning, transformation and processed dataset generation from raw synthetic records.',
      },
      {
        name: 'scikit-learn',
        projects: ['care-operations-analytics'],
        note: 'An interpretable logistic-regression claim-review prioritizer, with a published model card.',
      },
      {
        name: 'SQL & PostgreSQL',
        projects: ['care-operations-analytics'],
        note: 'A PostgreSQL-ready star schema, dimension and fact tables, and analytical SQL views.',
      },
      {
        name: 'Streamlit & Plotly',
        projects: ['care-operations-analytics'],
        note: 'A CSV-first four-page operational dashboard with no database requirement.',
      },
      {
        name: 'Power BI',
        projects: ['care-operations-analytics'],
        note: 'Care Portfolio Analytics: KPI cards, monthly trends, service-type comparison and a slicer.',
      },
      {
        name: 'Tableau',
        projects: ['care-operations-analytics'],
        note: 'Care Operations Executive Pulse: a consolidated leadership view with service and funding indicators.',
      },
    ],
  },
  {
    id: 'backend',
    label: 'Backend & tooling',
    short: 'Backend',
    description:
      'Small services and local tools with validated inputs, predictable writes and tests that describe behavior.',
    skills: [
      {
        name: 'FastAPI',
        projects: ['tennis-lesson-planner'],
        note: 'Five documented endpoints, request validation and automatic OpenAPI documentation.',
      },
      {
        name: 'Pydantic',
        projects: ['tennis-lesson-planner'],
        note: 'Input validation for player, level, goal and lesson duration.',
      },
      {
        name: 'SQLite',
        projects: ['tennis-lesson-planner'],
        note: 'Saved lesson plans with a persistent Docker volume.',
      },
      {
        name: 'Docker',
        projects: ['tennis-lesson-planner'],
        note: 'A container image and named data volume for repeatable local runs.',
      },
      {
        name: 'Typer CLI',
        projects: ['job-search-ops'],
        note: 'Lane, verify, docs, tracker, reports and safety command groups.',
      },
      {
        name: 'pytest',
        projects: ['tennis-lesson-planner', 'job-search-ops'],
        note: 'Automated API and safety-contract tests, run locally and in documented workflows.',
      },
    ],
  },
  {
    id: 'practice',
    label: 'Engineering practice',
    short: 'Practice',
    description:
      'Regression contracts, data-quality checks, privacy defaults and documentation another engineer can follow.',
    skills: [
      {
        name: 'Automated regression',
        projects: ['northgate-motors', 'nova-grants', 'care-operations-analytics'],
        note: '80 LWC contracts, 41 deployed Apex tests and a project-level pytest and CI suite.',
      },
      {
        name: 'Metadata validation',
        projects: ['nova-grants', 'revops-platform'],
        note: 'Dry-run validation and scoped component checks before deployment.',
      },
      {
        name: 'Data-quality gates',
        projects: ['care-operations-analytics'],
        note: '53 configurable checks that separate invalid records with an audit trail.',
      },
      {
        name: 'Privacy-aware prototyping',
        projects: ['job-search-ops', 'care-operations-analytics'],
        note: 'Local-only tooling, synthetic data and no silent writes or public personal information.',
      },
      {
        name: 'Technical documentation',
        projects: ['northgate-motors', 'nova-grants', 'care-operations-analytics', 'job-search-ops'],
        note: 'Architecture notes, acceptance registers, model cards, limitations and setup paths.',
      },
    ],
  },
];

export const skillGroups: SkillGroup[] = generatedDraft ? generatedDraft.skills.map((group) => {
  const original = approvedSkillGroups.find((entry) => entry.id === group.id);
  return {
    id: group.id, label: group.label, short: original?.short ?? group.label,
    description: original?.description ?? 'Owner-reviewed capabilities.',
    skills: group.items.filter(Boolean).map((name) => original?.skills.find((skill) => skill.name === name) ?? {
      name, projects: [], note: 'Owner-reviewed skill; project evidence has not been linked.',
    }),
  };
}) : approvedSkillGroups;

export const allSkills = skillGroups.flatMap((group) =>
  group.skills.map((skill) => ({ ...skill, group: group.label, groupId: group.id })),
);

export const resumeCapabilities = generatedDraft
  ? generatedDraft.skills.map((group) => ({ label: group.label, items: group.items.filter(Boolean) }))
  : [
  {
    label: 'Salesforce',
    items: ['Flow Builder', 'Apex & LWC', 'Custom objects', 'Permissions & reporting'],
  },
  {
    label: 'Apple',
    items: ['Swift & iOS', 'watchOS', 'WidgetKit & ActivityKit', 'HealthKit'],
  },
  {
    label: 'Analytics',
    items: ['Python & pandas', 'SQL & PostgreSQL', 'scikit-learn', 'Tableau · Power BI · Streamlit'],
  },
  {
    label: 'Delivery',
    items: ['Automated regression', 'Metadata validation', 'Documentation', 'Privacy-safe data'],
  },
];
