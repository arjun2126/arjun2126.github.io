/**
 * Owner-approved professional content.
 *
 * Source: ArjunOS_Profile_Handoff (2 November 2026), derived from approved
 * résumé masters and public repositories. This file intentionally excludes
 * phone, street address, work-authorization status, compensation, application
 * records, and Salesforce credential IDs. Matchpoint Tennis is omitted because
 * no title or dates were approved for publication.
 */

import { generatedDraft } from './generated';

export interface EmploymentEntry {
  id: string;
  employer: string;
  title: string;
  period: string;
  location: string;
  summary: string;
  responsibilities: string[];
  technologies: string[];
  current?: boolean;
}

const approvedProfessional = {
  name: 'Arjun Subramanya',
  headline:
    'Salesforce developer and administrator focused on business systems, analytics and AI-assisted delivery.',
  shortPitch:
    'I build and support Salesforce systems for operations teams: Flow automation, custom objects, permissions and reporting, plus Apex and Lightning components when configuration is not enough. I also work in Python, SQL and Swift, and use AI coding tools inside a tested, reviewed workflow.',
  location: 'Whitby, Ontario, Canada',
  availability: 'Open to Salesforce developer, administrator, and business-systems roles across Canada.',
  github: 'https://github.com/arjun2126',
  linkedin: 'https://www.linkedin.com/in/arjunsubra',
  specialization:
    'I work configuration-first on Salesforce delivery for program and operations teams, with enough Apex and LWC depth to build the custom parts.',
  employment: [
    {
      id: 'swr',
      employer: 'SWR',
      title: 'Business Systems Developer & Administrator',
      period: 'April 2025 – Present',
      location: 'Waterloo Region, Ontario',
      current: true,
      summary:
        'I manage the Salesforce platform for a Waterloo Region organization. The role covers daily administration, Flow automation and custom objects, reporting for program directors and the executive board, user support and training, and Apex and Lightning work where custom behavior is needed.',
      responsibilities: [
        'Administer Salesforce for staff and volunteers: users, permission sets, organization-wide defaults and sharing, with changes tracked in Git.',
        'Automate volunteer intake and program registration with Flow Builder, validation rules and approval workflows.',
        'Configure custom objects, page layouts, formula fields and validation rules for corporate pledges, programs and energy-reduction tracking.',
        'Build reports and operational dashboards for program directors and the executive board.',
        'Troubleshoot platform issues, communicate changes to users and lead group training; contribute Apex, SOQL and LWC work with unit tests.',
        'Coordinate change promotion across sandbox, UAT and production, and verify REST integration payloads and data mapping.',
      ],
      technologies: ['Salesforce', 'Flow Builder', 'Apex', 'LWC', 'SOQL', 'Git', 'Data Loader', 'Tableau'],
    },
    {
      id: 'uttara',
      employer: 'Uttara Infotech Solutions',
      title: 'Junior Software Engineer & CRM Analyst',
      period: 'September 2020 – September 2023',
      location: 'Bengaluru, India',
      summary:
        'Built Apex and REST integrations, migrated and de-duplicated large data sets, and produced Tableau dashboards for executive KPI reporting.',
      responsibilities: [
        'Built Apex triggers, Visualforce pages and REST integrations with unit tests, maintaining 85%+ code coverage.',
        'Led cleanup and migration of 50,000+ student and partner records with standardization and de-duplication.',
        'Mapped data flows between internal systems and QuickBooks and HubSpot, verifying mapping accuracy.',
        'Wrote and optimized SQL and SOQL queries with selective indexing for analytical workloads.',
        'Designed Tableau dashboards for enrollment, course performance and placement KPIs.',
        'Supported releases, sandbox testing and UAT, and performed monthly system audits.',
      ],
      technologies: ['Apex', 'Visualforce', 'SOQL', 'SQL', 'REST', 'Tableau', 'Data Loader', 'Git'],
    },
  ] satisfies EmploymentEntry[],
  education: [
    {
      credential: 'Post-Graduate Diploma, Sport Business Management',
      institution: 'Durham College',
      location: 'Oshawa, Ontario, Canada',
      focus: 'Analytics and project management',
      dates: 'Dates not published',
    },
    {
      credential: 'Bachelor of Engineering, Computer Science',
      institution: 'MS Ramaiah Institute of Technology',
      location: 'Bengaluru, India',
      focus: 'Object-oriented programming, databases and systems analysis',
      dates: 'Dates not published',
    },
  ],
  certifications: [
    'Salesforce Certified Administrator',
    'Salesforce Certified Platform App Builder',
    'Salesforce Certified Platform Developer I',
    'Salesforce Certified Agentforce Specialist',
  ],
  note:
    'Employment, education and certification names are drawn from the approved professional record. Credential IDs, total-years figures and unverified technical claims are not published.',
};

const draft = generatedDraft;
export const professional = {
  ...approvedProfessional,
  ...(draft ? {
    name: draft.profile.name,
    headline: draft.profile.headline,
    shortPitch: draft.profile.summary,
    github: draft.profile.github,
    linkedin: draft.profile.linkedin,
    employment: draft.career.experience.map((entry, index): EmploymentEntry => {
      const original = approvedProfessional.employment.find((role) => entry.id ? role.id === entry.id :
        role.title === entry.title && `${role.employer} · ${role.location}` === entry.org);
      return original ? { ...original, title: entry.title, period: entry.period, summary: entry.body,
        ...(entry.org !== `${original.employer} · ${original.location}` ? { employer: entry.org, location: '' } : {}),
      } : {
        id: `studio-${index}`, title: entry.title, employer: entry.org,
        period: entry.period, location: '', summary: entry.body, responsibilities: [], technologies: [],
      };
    }),
    education: draft.career.education.filter(Boolean).map((line) => {
      const original = approvedProfessional.education.find((entry) => `${entry.credential} — ${entry.institution}` === line);
      return original ?? { credential: line, institution: '', location: '', focus: '', dates: '' };
    }),
    certifications: draft.career.certifications.filter(Boolean),
  } : {}),
};

export const aiPositioning = {
  headline: 'AI-assisted software engineering and agentic workflow design',
  summary:
    'Most of my AI work is about trust boundaries rather than models. I write the specifications, approval checkpoints and automated checks that let an AI coding agent do real work without overstating what it produced.',
  closing:
    'I have not trained or fine-tuned models, and I have not deployed a production LLM system. My work is the engineering around the model: specifications, tools, permissions, verification, and the human approval that keeps it honest.',
  nonClaims: [
    'No foundation-model training or fine-tuning',
    'No production LLM deployment',
    'No LLM application code; the lesson-planner generator is rule-based',
    'No model selection or token-cost optimization work',
    'No AI architecture or staff-level AI engineering role',
  ],
};
