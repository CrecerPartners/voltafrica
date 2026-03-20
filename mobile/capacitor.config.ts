import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.voltafrica.app',
  appName: 'VoltAfrica',
  webDir: '../dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
    },
  },
};

export default config;
