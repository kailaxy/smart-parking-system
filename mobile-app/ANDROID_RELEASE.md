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

This uses the `submit.production.android` config in `eas.json` and submits to the
`production` track. Ensure a Google Play service account JSON is configured in the
EAS project settings before running.

## 5. Phased (staged) rollout strategy

A full production rollout to all users at once carries risk. Use Google Play's staged
rollout to limit exposure and catch issues early.

### Recommended stages

| Stage | Rollout % | Hold duration | Criteria to advance |
| ----- | --------- | ------------- | ------------------- |
| Internal testing | 0 % (internal track) | Verify build installs and Firebase connects | All gates in `LAUNCH_GATE.md` pass |
| Closed testing (Alpha) | 0 % (alpha track) | 1–2 days | No crash spikes, real-time listener works |
| Open testing (Beta) | 10 % | 2–3 days | Crash-free rate ≥ 99 %, no Firestore errors |
| Staged production | 20 % → 50 % → 100 % | 1 day per step | ANR and crash rate within Play Console thresholds |

### How to set the rollout percentage via EAS submit

EAS submit sets the initial track. After the initial submission, manage the staged
percentage from the Google Play Console:

1. **Play Console → Release → Production → Releases**.
2. Select the submitted release.
3. Click **Edit release** → set **Rollout percentage**.
4. Monitor **Android Vitals** for crash rate and ANR rate.
5. Pause the rollout if crash-free sessions drop below 99 %.
6. Resume or expand only when metrics are stable.

### Rollback on Android

If a critical issue is found after rollout:

1. In Play Console, **Halt rollout** on the current release.
2. Submit a new build with the fix and a higher `EXPO_ANDROID_VERSION_CODE`.
3. Resume staged rollout from 10 %.

## 6. Optional validation

Typecheck before build:

```bash
npm run typecheck
npm run validate:android:env:prod
```

