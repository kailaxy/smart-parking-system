import type { ConfigContext, ExpoConfig } from '@expo/config';

const BASE_ANDROID_PACKAGE = 'com.kailaxy.smartparkingsystem';

const parseVersionCode = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = process.env.APP_ENV ?? 'development';
  const isProduction = appEnv === 'production';

  const androidPackage =
    process.env.EXPO_ANDROID_PACKAGE ??
    (isProduction ? BASE_ANDROID_PACKAGE : `${BASE_ANDROID_PACKAGE}.dev`);

  const versionCode = parseVersionCode(
    process.env.EXPO_ANDROID_VERSION_CODE,
    isProduction ? 1 : 1
  );

  return {
    ...config,
    name: 'Smart Parking',
    slug: 'smart-parking-system',
    version: config.version ?? '1.0.0',
    android: {
      ...config.android,
      package: androidPackage,
      versionCode,
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      ...config.extra,
      appEnv,
    },
  };
};
