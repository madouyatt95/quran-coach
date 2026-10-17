import {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Capacitor} from '@capacitor/core';
import {useSettingsStore} from '../stores/settingsStore';

export function useWidgetNavigation() {
  const location = useLocation(), navigate = useNavigate();
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !new URLSearchParams(location.search).has('widget')) return;
    let cancelled = false;
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
