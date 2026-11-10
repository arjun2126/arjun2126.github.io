import type { Route } from '../lib/router';
import type { WindowState } from '../lib/windows';
import { projectBySlug } from '../content/projects';
import { AboutContent } from './AboutContent';
import { AIView } from './os/AIView';
import { CertificationsView } from './os/CertificationsView';
import { ContentStudio } from './os/ContentStudio';
import { ExperienceView } from './os/ExperienceView';
import { MainWindow } from './os/MainWindow';
import { NorthgateLive } from './os/NorthgateLive';
import { RecruiterView } from './os/RecruiterView';
import { SalesforceView } from './os/SalesforceView';
import { ContactContent } from './ContactContent';
import { NotFoundContent } from './NotFoundContent';
import { ProjectArticle } from './ProjectArticle';
import { ResumeContent } from './ResumeContent';
import { SkillsExplorer } from './SkillsExplorer';
import { Walkthrough } from './os/Walkthrough';

const subtitles: Partial<Record<WindowState['kind'], string>> = {
  recruiter: 'A streamlined view for hiring managers',
  salesforce: 'Salesforce Development Portfolio',
  project: 'Case study · public repository',
  resume: 'Evidence-based profile',
  skills: 'Skill index with sources',
  about: 'How this portfolio was built',
  contact: 'Public contact routes',
  ai: 'Applied practice and experiments',
  experience: 'Project-based record',
  certifications: 'Salesforce certification names and issuer',
  live: 'Published Salesforce buyer experience',
  content: 'Local authoring tool',
  notfound: 'Route not found',
};

export function windowTitle(win: WindowState): string {
  if (win.kind === 'projects') return 'ArjunOS';
  if (win.kind === 'project') return projectBySlug[win.slug ?? '']?.name ?? 'Project';
  if (win.kind === 'resume') return 'Résumé';
  if (win.kind === 'skills') return 'Skills';
  if (win.kind === 'about') return 'About';
  if (win.kind === 'contact') return 'Contact';
  if (win.kind === 'recruiter') return 'Recruiter Mode';
  if (win.kind === 'salesforce') return 'Salesforce Workspace';
  if (win.kind === 'ai') return 'AI Engineering';
  if (win.kind === 'experience') return 'Experience';
  if (win.kind === 'certifications') return 'Certifications';
  if (win.kind === 'live') return 'Northgate Live';
  if (win.kind === 'walkthrough') return 'Walkthrough';
  if (win.kind === 'content') return 'Content Studio';
  return 'Not found';
}

export function windowSubtitle(win: WindowState): string | undefined {
  return subtitles[win.kind];
}

export function windowPlain(win: WindowState): boolean {
  return win.kind === 'projects';
}

export function WindowContent({ win, route }: { win: WindowState; route: Route }) {
  switch (win.kind) {
    case 'projects':
      return <MainWindow route={route} />;
    case 'project': {
      const project = projectBySlug[win.slug ?? ''];
      return project ? <ProjectArticle project={project} /> : <NotFoundContent path={route.path} />;
    }
    case 'recruiter':
      return <RecruiterView />;
    case 'salesforce':
      return <SalesforceView />;
    case 'ai':
      return <AIView />;
    case 'experience':
      return <ExperienceView />;
    case 'certifications':
      return <CertificationsView />;
    case 'live':
      return <NorthgateLive />;
    case 'walkthrough':
      return <Walkthrough />;
    case 'content':
      return <ContentStudio />;
    case 'resume':
      return <ResumeContent />;
    case 'skills':
      return <SkillsExplorer />;
    case 'about':
      return <AboutContent />;
    case 'contact':
      return <ContactContent />;
    case 'notfound':
      return <NotFoundContent path={route.path} />;
  }
}
