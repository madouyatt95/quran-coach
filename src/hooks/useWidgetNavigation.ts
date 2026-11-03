import {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Capacitor} from '@capacitor/core';
import {useSettingsStore} from '../stores/settingsStore';

export function useWidgetNavigation() {
  const location = useLocation(), navigate = useNavigate();
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !new URLSearchParams(location.search).has('widget')) return;
    let cancelled = false;
    const marker = new URLSearchParams(location.search).get('widget');
    if (location.pathname === '/read' && marker === 'khatm') {
      void import('../stores/khatmStore').then(({useKhatmStore}) => {
        if (cancelled) return;
        const plan = useKhatmStore.getState();
        navigate(plan.isActive && !plan.completedAt ? `/read?page=${plan.getNextPage()}` : '/read', {replace: true});
      });
      return () => {cancelled = true;};
    }
    if (location.pathname === '/listen' && marker === 'audio') {
      void import('../lib/lockScreenAudio').then(async audio => {
        await audio.prepareWidgetAudio().catch(() => {});
        if (cancelled) return;
        const latest = audio.latestWidgetAudio();
        navigate(latest?.route ?? '/listen', {replace: true, state: latest ? {widgetListen: true} : undefined});
        await latest?.play();
      });
      return () => {cancelled = true;};
    }
    void Promise.all([import('../lib/activityWidgetData'), import('../lib/activityWidgets')]).then(([data, state]) => {
      if (cancelled) return;
      const destination = data.activityWidgetDestination(location.pathname, location.search, state.activityWidgetInput());
      if (!destination) return;
      if (destination.view) useSettingsStore.getState().setViewMode(destination.view);
      navigate(destination.route, {replace: true});
    });
    return () => {cancelled = true;};
  }, [location.pathname, location.search, navigate]);
}
