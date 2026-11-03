import type { Route } from '../../lib/router';
import { HomeView } from './HomeView';
import { ProjectsView } from './ProjectsView';
import { Sidebar } from './Sidebar';

export function MainWindow({ route }: { route: Route }) {
  const showProjects = route.kind === 'app' && route.app === 'projects';

  return (
    <div className="os-app os-main">
      <Sidebar />
      <div className="os-main__content" data-route-scroll>
        {showProjects ? <ProjectsView /> : <HomeView />}
      </div>
    </div>
  );
}
