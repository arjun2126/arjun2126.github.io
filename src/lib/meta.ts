import type { Route } from './router';
import { projectBySlug } from '../content/projects';

export interface PageMeta {
  title: string;
  description: string;
}

const baseDescription =
  'Arjun Subramanya is a Salesforce developer and administrator in Whitby, Ontario, building business systems, analytics and native Apple apps.';

export function metaForRoute(route: Route): PageMeta {
  if (route.kind === 'project') {
    const project = projectBySlug[route.slug];
    if (project) {
      return {
        title: `${project.name} — Arjun Subramanya`,
        description: project.seoDescription,
      };
    }
  }

  if (route.kind === 'app') {
    switch (route.app) {
      case 'projects':
        return {
          title: 'Projects — Arjun Subramanya',
          description:
            'Browse eight public projects across Salesforce, Apple platforms, analytics and backend tooling, with source links and limitations.',
        };
      case 'recruiter':
        return {
          title: 'Recruiter Mode — Arjun Subramanya',
          description:
            'A recruiter-focused overview of Arjun Subramanya: Salesforce development, software engineering, native iOS work and AI-assisted delivery.',
        };
      case 'salesforce':
        return {
          title: 'Salesforce Workspace — Arjun Subramanya',
          description:
            'Salesforce development evidence across Apex, LWC, Flow, data modelling, security, architecture, testing and deployment.',
        };
      case 'ai':
        return {
          title: 'AI Engineering — Arjun Subramanya',
          description:
            'Applied AI engineering: agentic development workflows, specification-driven harnesses, integrations and human review practices.',
        };
      case 'experience':
        return {
          title: 'Experience — Arjun Subramanya',
          description:
            'Project-based experience across Salesforce platform builds, native Apple development and analytics engineering.',
        };
      case 'certifications':
        return {
          title: 'Certifications — Arjun Subramanya',
          description:
            'Owner-approved Salesforce certifications and their issuer. Certification names only; documents, dates and verification links are not published.',
        };
      case 'live':
        return {
          title: 'Northgate Live — Arjun Subramanya',
          description:
            'Explore the published Northgate Motors Salesforce Experience Cloud buyer site. Verified framing status, genuine captures, inventory and 3D Studio routes.',
        };
      case 'walkthrough':
        return { title: 'Walkthrough — ArjunOS', description: 'A genuine recorded walkthrough of ArjunOS, when supplied by the owner.' };
      case 'resume':
        return {
          title: 'Résumé — Arjun Subramanya',
          description:
            'An evidence-based résumé built from public project work: Salesforce, Apple platforms, analytics and engineering practice.',
        };
      case 'skills':
        return {
          title: 'Skills & Evidence — Arjun Subramanya',
          description:
            'Explore Arjun Subramanya’s technical toolkit by discipline, with every skill linked to the project that demonstrates it.',
        };
      case 'about':
        return {
          title: 'About — Arjun Subramanya',
          description:
            'About Arjun Subramanya, the principles behind the work, and how this evidence-first desktop portfolio was assembled.',
        };
      case 'contact':
        return {
          title: 'Contact — Arjun Subramanya',
          description:
            'Contact Arjun Subramanya through GitHub and connect with the public repositories behind the portfolio.',
        };
      case 'content':
        return {
          title: 'Content Studio (local) — ArjunOS',
          description: 'A local-only editor for ArjunOS content. Not part of the published website.',
        };
    }
  }

  if (route.kind === 'notfound') {
    return {
      title: 'Page not found — Arjun Subramanya',
      description: 'This ArjunOS route does not exist. Return to the desktop or open Recruiter Mode.',
    };
  }

  return {
    title: 'Arjun Subramanya — Salesforce Developer & Software Engineer',
    description: baseDescription,
  };
}

export function appTitleFromRoute(route: Route): string {
  if (route.kind === 'app') {
    const titles: Record<string, string> = {
      projects: 'Projects',
      recruiter: 'Recruiter Mode',
      salesforce: 'Salesforce Workspace',
      ai: 'AI Engineering',
      experience: 'Experience',
      certifications: 'Certifications',
      live: 'Northgate Live',
      resume: 'Résumé',
      skills: 'Skills',
      about: 'About',
      contact: 'Contact',
      content: 'Content Studio',
    };
    return titles[route.app] ?? 'ArjunOS';
  }
  if (route.kind === 'project') return projectBySlug[route.slug]?.name ?? 'Project';
  if (route.kind === 'notfound') return 'Not found';
  return 'ArjunOS';
}
