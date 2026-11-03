import { generatedDraft } from './generated';
import { classifyVideoUrl } from '../lib/studioContent';

const saved = generatedDraft?.walkthrough;

export interface WalkthroughChapter {
  title: string;
  body: string;
  href: string;
}

const rawUrl = saved?.url?.trim() ?? '';
const classified = classifyVideoUrl(rawUrl);
const supplied = Boolean(classified.embedUrl || classified.provider === 'external');

/**
 * The walkthrough is owner-supplied. Until an approved recording is configured
 * through Content Studio the site states that plainly and lists the chapters the
 * recording will cover. No demonstration is ever generated or imitated.
 */
export const walkthrough = {
  url: supplied ? rawUrl : '',
  title: saved?.title?.trim() || 'A guided walkthrough of ArjunOS',
  summary:
    saved?.summary?.trim() ||
    'A recorded walkthrough of the portfolio: navigation, Recruiter Mode, the Salesforce Workspace, Northgate Motors, Nova Grants, Vantage, AI Engineering and the public repositories.',
  provider: supplied ? classified.provider : ('none' as const),
  embedUrl: supplied ? classified.embedUrl : null,
  externalUrl: supplied ? classified.externalUrl : '',
  supplied,
};

export const walkthroughChapters: WalkthroughChapter[] = [
  {
    title: 'ArjunOS navigation',
    body: 'The desktop, menu bar, Dock and window manager: opening, moving, minimizing and restoring windows, then searching and filtering the project registry.',
    href: '/projects/',
  },
  {
    title: 'Recruiter Mode',
    body: 'The standalone hiring view: summary, experience, skills, selected work and credentials in one scrollable sheet.',
    href: '/recruiter/',
  },
  {
    title: 'Salesforce Workspace',
    body: 'Apex, Lightning Web Components, Flow, data modelling, permissions and deployment evidence, each linked to its public repository.',
    href: '/salesforce/',
  },
  {
    title: 'Northgate Motors',
    body: 'The Experience Cloud buyer site: live framing status, verified captures, inventory routes and the 3D Studio.',
    href: '/northgate-live/',
  },
  {
    title: 'Nova Grants',
    body: 'The grants case study: application intake, claim review, funding guards and native reporting.',
    href: '/projects/nova-grants/',
  },
  {
    title: 'Vantage',
    body: 'The iPhone, Apple Watch, widget and Live Activity scoring experience, described from the public repository.',
    href: '/projects/vantage/',
  },
  {
    title: 'AI Engineering',
    body: 'Applied agentic workflows with explicit human approval gates, plus the practices that keep generated work reviewable.',
    href: '/ai/',
  },
  {
    title: 'GitHub and contact',
    body: 'Where the source lives and how to get in touch through the published contact routes.',
    href: '/contact/',
  },
];
