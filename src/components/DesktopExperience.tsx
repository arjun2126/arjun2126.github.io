import { FolderOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '../lib/navigation';
import type { AppRoute, Route } from '../lib/router';
import { routeForApp } from '../lib/router';
import {
  closeWindow,
  focusWindow,
  initialWindows,
  minimizeWindow,
  moveWindow,
  reconcileWindows,
  resizeWindows,
  restoreWindow,
  routeWindows,
  toggleMaximize,
  topWindow,
  type Rect,
  type WindowId,
  type WindowState,
} from '../lib/windows';
import { Dock } from './os/Dock';
import { MenuBar } from './os/MenuBar';
import { Wallpaper } from './os/parts';
import { WindowContent, windowPlain, windowSubtitle, windowTitle } from './WindowContent';
import { WindowFrame } from './WindowFrame';

export function DesktopExperience({ route }: { route: Route }) {
  const { navigate } = useNavigation();
  const viewportRef = useRef({
    width: typeof window === 'undefined' ? 1600 : window.innerWidth,
    height: typeof window === 'undefined' ? 1000 : window.innerHeight,
  });
  const [windows, setWindows] = useState<WindowState[]>(() =>
    initialWindows(route, viewportRef.current),
  );
  const active = topWindow(windows);
  const primaryId = routeWindows(route).at(-1)?.id;

  useEffect(() => {
    const onResize = () => {
      viewportRef.current = { width: window.innerWidth, height: window.innerHeight };
      setWindows((current) => resizeWindows(current, viewportRef.current));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setWindows((current) => reconcileWindows(current, route, viewportRef.current));
  }, [route]);

  const focus = (id: WindowId) => setWindows((current) => focusWindow(current, id));

  const close = (win: WindowState) => {
    setWindows((current) => closeWindow(current, win.id));
    if (win.kind === 'projects') return;
    if (route.kind === 'notfound' || win.kind === 'project') {
      navigate('/');
      return;
    }
    if (route.kind === 'app' && win.id === route.app) navigate('/');
  };

  const openApp = (app: AppRoute) => {
    if (app === 'projects') {
      if (route.kind !== 'home') {
        navigate('/');
        return;
      }
      const win = windows.find((entry) => entry.id === 'projects');
      if (!win) {
        navigate('/');
        return;
      }
      if (win.minimized) {
        setWindows((current) => restoreWindow(current, 'projects'));
        return;
      }
      focus('projects');
      return;
    }

    const win = windows.find((entry) => entry.id === app);
    const current = route.kind === 'app' && route.app === app;
    if (current && win) {
      if (win.minimized) {
        setWindows((currentWindows) => restoreWindow(currentWindows, app));
        return;
      }
      focus(app);
      return;
    }
    if (current) return;
    navigate(routeForApp(app));
  };

  // Keep DOM order stable; z-index alone controls stacking. Reordering windows
  // between pointerdown and click cancels clicks inside a window that gains focus.
  const orderedWindows = windows;

  return (
    <div className="desktop">
      <Wallpaper />
      <MenuBar
        onMinimizeAll={() =>
          setWindows((current) => current.map((win) => ({ ...win, minimized: true })))
        }
        onRestoreAll={() =>
          setWindows((current) => current.map((win) => ({ ...win, minimized: false })))
        }
      />
      <main className="desktop-stage" id="main-content" aria-label="ArjunOS desktop">
        <div className="window-layer">
          {orderedWindows.map((win) => (
            <WindowFrame
              key={win.id}
              win={win}
              title={windowTitle(win)}
              subtitle={windowSubtitle(win)}
              plain={windowPlain(win)}
              active={active?.id === win.id}
              autoFocus={primaryId === win.id && route.kind !== 'home' && win.kind !== 'projects'}
              onClose={() => close(win)}
              onMinimize={() => setWindows((current) => minimizeWindow(current, win.id))}
              onMaximize={() => setWindows((current) => toggleMaximize(current, win.id))}
              onFocus={() => focus(win.id)}
              onMove={(rect: Rect) => setWindows((current) => moveWindow(current, win.id, rect))}
            >
              <WindowContent win={win} route={route} />
            </WindowFrame>
          ))}
        </div>

        {windows.length === 0 ? (
          <div className="desktop-empty">
            <span className="desktop-empty__mark" aria-hidden="true">
              A
            </span>
            <p>Everything is tucked away.</p>
            <button type="button" className="os-button os-button--glass" onClick={() => navigate('/')}>
              <FolderOpen size={16} aria-hidden="true" />
              Open Projects
            </button>
          </div>
        ) : null}

        <Dock windows={windows} route={route} onOpen={openApp} />
      </main>
    </div>
  );
}
