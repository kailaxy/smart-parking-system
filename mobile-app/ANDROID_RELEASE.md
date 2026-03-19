# Android Release Guide (EAS)

## 1. Prerequisites

- Install dependencies:

```bash
npm install
```

- Install EAS CLI (global):

```bash
npm install -g eas-cli
```

- Login and link project:

```bash
eas login
eas init
```

## 2. Environment setup

Create a local `.env` from `.env.example` and fill in real Firebase values.

For production Android builds, also define:

```bash
EXPO_ANDROID_PACKAGE=com.kailaxy.smartparkingsystem
EXPO_ANDROID_VERSION_CODE=1
```

## 3. Build commands

Internal testing APK:

```bash
npm run eas:build:android:preview:checked
```

Production AAB:

```bash
npm run eas:build:android:prod:checked
```

## 4. Submit to Google Play

After a successful production build:

```bash
npm run eas:submit:android
```

## 5. Optional validation

Typecheck before build:

```bash
npm run typecheck
npm run validate:android:env:prod
```
