import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qurancoach.app',
  appName: 'Quran Coach',
  webDir: 'dist',
  server: {
    // In production, the app loads from local files (no server needed)
    // For development, you can uncomment the line below with your local IP:
    // url: 'http://192.168.x.x:5173',
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'Quran Coach',
  },
};

export default config;
