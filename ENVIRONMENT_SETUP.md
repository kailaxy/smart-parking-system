# Environment Setup (Plan Phase 1)

This repository now enforces environment-based configuration for safer production releases.

## 1. Mobile App (`mobile-app/.env`)

Start from `mobile-app/.env.example` and provide real values:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`

Android release-specific values:

- `EXPO_ANDROID_PACKAGE`
- `EXPO_ANDROID_VERSION_CODE`
- `APP_ENV` (`development` or `production`)

## 2. Admin App (`admin-app/.env`)

Start from `admin-app/.env.example` and provide real values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## 3. Firebase Hosting Baseline

Root files added:

- `firebase.json`: serves `admin-app/dist` with SPA rewrites.
- `.firebaserc`: default project alias placeholder (`your-firebase-project-id`).

Replace `.firebaserc` default with your real Firebase project before deploy.

## 4. Seed Script Safety

`mobile-app/scripts/seed-firestore.mjs` now fails fast if required Firebase env vars are missing.
No credential fallback values remain.

## 5. Quick Validation

```bash
cd mobile-app
npm run typecheck
npm run validate:android:env:prod
```
