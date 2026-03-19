# Environment Setup

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

## 3. Firebase Hosting — Staging and Production Targets

`firebase.json` defines two named hosting targets:

- `admin-staging` — deployed from the `staging` branch
- `admin-production` — deployed from `main`

`.firebaserc` maps these targets to Firebase project IDs. Replace the placeholders
with your real project IDs before deploying:

```json
{
  "projects": {
    "default": "<production-firebase-project-id>",
    "staging": "<staging-firebase-project-id>",
    "production": "<production-firebase-project-id>"
  }
}
```

### GitHub Actions secrets required for deploy

| Secret | Used for |
| ------ | -------- |
| `FIREBASE_PROJECT_ID` | Production Firebase project ID |
| `FIREBASE_SERVICE_ACCOUNT` | Production service account JSON |
| `FIREBASE_STAGING_PROJECT_ID` | Staging Firebase project ID |
| `FIREBASE_STAGING_SERVICE_ACCOUNT` | Staging service account JSON |
| `VITE_FIREBASE_API_KEY` | Admin app Firebase config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Admin app Firebase config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Admin app Firebase config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Admin app Firebase config |
| `VITE_FIREBASE_APP_ID` | Admin app Firebase config |

### Manual deploy

```bash
# Staging
firebase use staging
firebase deploy --only hosting:admin-staging

# Production
firebase use production
firebase deploy --only hosting:admin-production,firestore:rules,firestore:indexes
```

## 4. Seed Script Safety

`mobile-app/scripts/seed-firestore.mjs` fails fast if required Firebase env vars are missing.
No credential fallback values remain.

## 5. Quick Validation

```bash
cd mobile-app
npm run typecheck
npm run validate:android:env:prod
```

```bash
cd admin-app
npm run typecheck
npm run build
```
