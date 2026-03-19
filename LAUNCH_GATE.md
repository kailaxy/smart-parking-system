# Launch Gate Verification

Run all checks below before merging the release branch to `main`.
Every item must be ticked before the PR is approved.

---

## Gate 1 — Typecheck and Build

```bash
cd admin-app && npm ci && npm run typecheck && npm run build
cd mobile-app && npm ci && npm run typecheck
```

- [ ] `admin-app` typecheck exits 0
- [ ] `admin-app` build exits 0 and `dist/` is produced
- [ ] `mobile-app` typecheck exits 0

---

## Gate 2 — Environment Validation

```bash
cd mobile-app
npm run validate:android:env:prod
```

- [ ] Android production env validation exits 0 (no missing variables)
- [ ] No hardcoded Firebase credentials exist in source:

  ```bash
  git grep -rE "(AIza[0-9A-Za-z_-]{35}|-----BEGIN (RSA |EC )?PRIVATE KEY|\"private_key_id\"|AAAA[A-Za-z0-9_-]{100})" \
    -- '*.ts' '*.tsx' '*.mjs' '*.js' '*.json' '*.env'
  ```

  The command must return no output.

---

## Gate 3 — Firestore Rules Validation

Deploy rules to the staging project first:

```bash
firebase use staging
firebase deploy --only firestore:rules,firestore:indexes
```

Then confirm the following manually or via the Firebase Rules Playground:

- [ ] Unauthenticated read of `parking_slots` → **denied**
- [ ] Authenticated non-admin read of `parking_slots` → **allowed**
- [ ] Authenticated non-admin write to `parking_slots` → **denied**
- [ ] Authenticated admin write to `parking_slots` → **allowed**
- [ ] Read of `admins` collection by non-admin → **denied**

---

## Gate 4 — Seed and Data Consistency

Run against the staging project:

```bash
cd mobile-app
# Ensure .env points to staging Firebase project
npm run seed:dataset
npm run seed:verify
```

- [ ] `seed:dataset` exits 0
- [ ] `seed:verify` prints `SEED_VERIFY_OK` and exits 0
- [ ] No `unresolvedAreaRefs` in verify output
- [ ] `available_slots` counter on each parking area matches the actual count of available slots

---

## Gate 5 — Staging Deploy Smoke Test

Trigger the `Deploy Admin To Firebase Hosting` workflow on the `staging` branch:

- [ ] CI workflow completes without errors
- [ ] Staging URL loads the admin app without a white screen
- [ ] Admin app connects to Firestore and displays parking areas
- [ ] Toggling a slot status in the admin app reflects immediately in the mobile app (real-time listener)
- [ ] Refreshing the mobile app shows the updated `available_slots` counter

---

## Gate 6 — End-to-End Flow

Perform the following sequence manually:

1. In the **admin app** (staging), change slot `A-1` from `available` → `occupied`.
2. In the **mobile app** (staging), navigate to Car Parking A.
3. Verify slot `A-1` shows as occupied without a manual refresh.
4. Verify the `available_slots` count for Car Parking A decreased by 1.
5. Revert slot `A-1` back to `available`.
6. Verify the counter increments back.

- [ ] Slot status change propagates to mobile in real time (< 3 seconds)
- [ ] `available_slots` counter is consistent after each toggle
- [ ] No Firestore permission errors appear in the browser or device console

---

## Gate 7 — Android EAS Build

Trigger the `Android EAS Build` workflow with profile `production`:

- [ ] Workflow completes without errors
- [ ] EAS produces a signed `.aab` artifact
- [ ] `eas submit --platform android --latest` command is ready (service account JSON configured in EAS project)

---

## Gate 8 — Pre-merge Checklist

- [ ] All gates above are ticked
- [ ] `MIGRATION_RUNBOOK.md` is up to date
- [ ] PR description includes staging URL
- [ ] PR description includes `seed:verify` output
- [ ] Firestore backup taken of the production project before merge (see `MIGRATION_RUNBOOK.md` §3)
- [ ] At least one reviewer has approved the PR
