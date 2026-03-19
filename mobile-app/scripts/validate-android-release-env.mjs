const target = (process.argv[2] ?? 'production').trim().toLowerCase();

const env = process.env;

const requiredForAll = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const requiredForProduction = ['EXPO_ANDROID_PACKAGE', 'EXPO_ANDROID_VERSION_CODE'];

const packageRegex = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;

const missing = requiredForAll.filter((name) => !env[name]);

if (target === 'production') {
  missing.push(...requiredForProduction.filter((name) => !env[name]));
}

if (missing.length > 0) {
  console.error('[validate-android-env] Missing required variables:');
  missing.forEach((name) => console.error(`  - ${name}`));
  process.exit(1);
}

if (env.EXPO_ANDROID_PACKAGE && !packageRegex.test(env.EXPO_ANDROID_PACKAGE)) {
  console.error(
    '[validate-android-env] EXPO_ANDROID_PACKAGE is invalid. Expected reverse-domain format like com.kailaxy.smartparkingsystem'
  );
  process.exit(1);
}

if (env.EXPO_ANDROID_VERSION_CODE) {
  const code = Number.parseInt(env.EXPO_ANDROID_VERSION_CODE, 10);
  if (!Number.isInteger(code) || code <= 0) {
    console.error('[validate-android-env] EXPO_ANDROID_VERSION_CODE must be a positive integer.');
    process.exit(1);
  }
}

console.log(`[validate-android-env] Environment is valid for target: ${target}`);
