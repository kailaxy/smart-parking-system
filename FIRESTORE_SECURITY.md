# Firestore Security Baseline

This repository now includes baseline production security files:

- `firestore.rules`
- `firestore.indexes.json`

## Rule model

- Authenticated users can read campus, parking areas, and parking slots.
- Only users with custom claim `admin == true` can write.
- Admin records (`admins` collection) are admin-only.
- All unspecified paths are denied.

## Deploy

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Important

These rules assume Firebase Authentication is enabled and admin users receive a custom claim:

- `admin: true`

Until auth + custom claims are fully configured, these rules are intentionally strict and may block app access for unauthenticated clients.
