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
  linkedin: saved?.linkedin || 'https://www.linkedin.com/in/arjunsubra',
  location: 'Whitby, Ontario, Canada',
  availability: 'Open to Salesforce developer, administrator, and business-systems roles across Canada.',
  title: 'Salesforce developer & administrator',
  disciplines: 'Salesforce · business systems · analytics',
  headline: saved?.headline || 'Business systems, built to hold up.',
  intro:
    'I build and run Salesforce systems — Flow automation, custom data models, permissions and reporting — and write the Apex and Lightning components when declarative tools run out. I also work in Python, SQL and Swift.',
  shortIntro:
    'Salesforce systems, analytics and native apps — built end to end, with the sources attached.',
  summary:
    saved?.summary ||
    'Salesforce developer and administrator with experience building business systems, analytics, and AI-assisted workflows. I work across Flow, Apex, Lightning components, permissions and reporting, with a parallel practice in Python, SQL and Swift.',
  approach: [
    {
      title: 'Evidence over adjectives',
      body: 'Every featured project links to the public repository it came from. Counts, test results and known limitations are quoted from that source, with the revision recorded.',
    },
    {
      title: 'The unglamorous parts count',
      body: 'Guest-safe data transfer, idempotent payments, rollback paths, empty states and 390-pixel layouts are part of the product, not cleanup after it.',
    },
    {
      title: 'Demo is not production',
      body: 'Fictional data, mock integrations and future features are labelled as such. A portfolio should make the boundary easy to see.',
    },
  ],
  resumeNote:
    'Employment, education and certification names come from an owner-approved professional handoff reviewed on 2 November 2026. Credential IDs, phone, street address, work-authorization details and total-years figures are deliberately excluded. A redacted, web-safe résumé PDF is still pending approval.',
  contactIntro:
    'I am based in Whitby, Ontario and open to Salesforce developer, administrator and business-systems roles across Canada. GitHub and LinkedIn are the verified public routes.',
  contactNote:
    saved?.contactNote ||
    'No public email or phone number is published. That is deliberate: contact is routed through LinkedIn, GitHub and the site contact page until email publication is approved.',
  sourceNote:
    'Project facts come from public repositories reviewed on 2 November 2026. Professional details come from the owner-approved handoff. Sources and caveats are recorded in docs/SOURCES.md.',
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

export const skillGroups: SkillGroup[] = [
  {
    id: 'salesforce',
    label: 'Salesforce platform',
    short: 'Salesforce',
    description:
      'Configuration, custom objects and code for real operational workflows — with authorization treated as part of the design.',
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
      'Native Swift work that spans the phone, the Watch, widgets and the places where a match becomes a live activity.',
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
      'Pipelines that earn trust before visualization: validation, an explicit model, and dashboards built around decisions.',
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
      'Small services and local tools with clear boundaries: validated inputs, predictable writes and tests that describe behaviour.',
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
      'How the work is kept honest: regression contracts, data-quality gates, privacy defaults and documentation that survives handoff.',
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

export const allSkills = skillGroups.flatMap((group) =>
  group.skills.map((skill) => ({ ...skill, group: group.label, groupId: group.id })),
);

export const resumeCapabilities = [
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
