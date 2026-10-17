import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { nativeAdhanNotifications, type AdhanEvent } from './adhanSchedule';
let queue: Promise<void> = Promise.resolve();
let revision = 0;
let lastPlan = '';
let lastSync = 0;
/** Serial replacement of our own notifications; never cancel other reminders. */
export function syncNativeAdhan(events: AdhanEvent[], enabled: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  const version = ++revision;
  queue = queue.catch(() => {}).then(async () => {
    if (version !== revision) return;
    const notifications = enabled ? nativeAdhanNotifications(events, Date.now()).map(n => ({
      ...n, sound: Capacitor.getPlatform() === 'ios' ? n.sound : 'default',
    })) : [];
    const signature = JSON.stringify({enabled, notifications});
    if (signature === lastPlan && Date.now() - lastSync < 3600000) return;
    lastPlan = '';
    const pending = await LocalNotifications.getPending();
    const own = pending.notifications.filter(n => n.id >= 7000 && n.id < 7025);
    if (own.length) await LocalNotifications.cancel({ notifications: own });
    if (!enabled || version !== revision) return;
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted' || version !== revision) return;
    if (notifications.length) await LocalNotifications.schedule({ notifications });
    lastPlan = signature; lastSync = Date.now();
  });
  return queue;
}
