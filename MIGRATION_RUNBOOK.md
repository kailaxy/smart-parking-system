# Migration Runbook

Operational reference for the Smart Parking System production release.
Covers branch strategy, versioning, database provisioning, backup/restore, and rollback.

---

## 1. Branch and Release Strategy

| Branch | Purpose |
| ------ | ------- |
| `main` | Production. Triggers `admin-production` deploy and Firestore rules/indexes deploy. |
| `staging` | Staging. Triggers `admin-staging` deploy only. |
| Feature/release branches | Created per release cycle; open a PR → `main` after the launch gate passes. |

### Versioning scheme

- **App version** (`mobile-app/app.json` → `expo.version`): semantic `MAJOR.MINOR.PATCH`.
- **Android versionCode** (`EXPO_ANDROID_VERSION_CODE` env var): monotonically increasing integer. Increment before every Play Store submission.
- **EAS runtimeVersion policy**: `appVersion` — OTA updates are gated to matching app versions.

### Before merging to main

1. All launch gate checks in `LAUNCH_GATE.md` must pass.
2. Staging deploy must succeed without errors.
3. `npm run seed:verify` must exit 0 against the production project.
4. PR description must include deploy evidence (staging URL + seed verify output).

---

## 2. Database Provisioning

### Collections

| Collection | Document ID pattern | Key fields |
| ---------- | ------------------- | ---------- |
| `campus` | `pnc_campus` | `name`, `description`, `created_at` |
| `parking_areas` | `area_A`, `area_B`, `motorcycle_area` | `name`, `type`, `total_slots`, `available_slots`, `map_position`, `created_at` |
| `parking_slots` | `A-1` … `A-30`, `B-1` … `B-20`, `M-1` … `M-50` | `slot_id`, `area_id`, `slot_number`, `status`, `vehicle_type`, `position`, `last_updated` |
| `admins` | Firebase UID | `name`, `email`, `role`, `created_at` |

### Deploy indexes and rules

```bash
firebase use production
firebase deploy --only firestore:rules,firestore:indexes
```

### Seed production data

```bash
cd mobile-app
# Copy .env.example → .env and fill in production Firebase values
npm run seed:dataset   # writes seed data (idempotent via merge)
npm run seed:verify    # exits 0 only if counts match expected values
```

Expected output from `seed:verify`:

```
SEED_VERIFY {"campusCount":1,"parkingAreasCount":3,"parkingSlotsCount":100,"availableCount":65,"occupiedCount":35,"unresolvedAreaRefs":[]}
SEED_VERIFY_OK
```

---

## 3. Backup and Restore Runbook

### Prerequisites

- Firebase CLI installed and authenticated: `firebase login`
- `gcloud` CLI installed and authenticated with the production service account
- `GOOGLE_CLOUD_PROJECT` set to the production Firebase project ID

### Backup (Firestore managed export)

Firestore exports write to a Cloud Storage bucket. Create the bucket once (if it doesn't exist):

```bash
BACKUP_BUCKET="gs://${GOOGLE_CLOUD_PROJECT}-firestore-backups"
gcloud storage buckets create "$BACKUP_BUCKET" \
  --project="$GOOGLE_CLOUD_PROJECT" \
  --location=asia-southeast1
```

Run an export:

```bash
# GNU date (Linux / CI):
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
# macOS (requires gnu-coreutils: brew install coreutils):
# TIMESTAMP=$(gdate -u +%Y%m%dT%H%M%SZ)
gcloud firestore export "${BACKUP_BUCKET}/backups/${TIMESTAMP}" \
  --project="$GOOGLE_CLOUD_PROJECT" \
  --collection-ids=campus,parking_areas,parking_slots,admins
```

Verify the export completed:

```bash
gcloud firestore operations list --project="$GOOGLE_CLOUD_PROJECT"
```

### Restore from backup

> ⚠️ Restore overwrites the target collection. Only restore to a non-production project unless recovering from data loss.

```bash
BACKUP_PATH="${BACKUP_BUCKET}/backups/<TIMESTAMP>"
gcloud firestore import "$BACKUP_PATH" \
  --project="$GOOGLE_CLOUD_PROJECT" \
  --collection-ids=campus,parking_areas,parking_slots,admins
```

After restore, run `npm run seed:verify` to confirm data integrity.

### Backup schedule recommendation

- Run a daily scheduled Cloud Scheduler job or set up automated Firestore PITR (Point-In-Time Recovery) via the Google Cloud Console.
- Retain backups for at least 30 days.

---

## 4. Firebase Hosting Rollback

If a production deploy causes a regression, roll back to the previous live version.

### Option A — Firebase CLI (immediate)

```bash
firebase use production
firebase hosting:rollback --project "$FIREBASE_PROJECT_ID"
```

This promotes the previous release to live instantly.

### Option B — GitHub Actions workflow

Trigger the `rollback-admin-firebase.yml` workflow from the GitHub Actions tab:

1. Navigate to **Actions → Rollback Admin Firebase Hosting**.
2. Click **Run workflow**.
3. Select `production` (or `staging`).
4. The workflow lists recent releases and re-deploys the last known-good release.

### Option C — Re-deploy a specific git ref

```bash
git checkout <known-good-sha>
cd admin-app && npm ci && npm run build
firebase use production
firebase deploy --only hosting:admin-production
```

### Rollback verification

After rollback, confirm the live URL serves the expected version by checking the build hash in the page source or Firebase Hosting console.
