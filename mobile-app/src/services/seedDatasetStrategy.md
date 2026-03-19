# Seed Dataset Strategy (Task 6.1)

## Target Scope

- Firestore project: `smart-parking-system-5d0c3`
- Collections to seed:
  - `campus`
  - `parking_areas`
  - `parking_slots`
- Source references:
  - `sample-dataset.md`
  - `parking-map-coordinate-guide.md`
  - `src/services/firestoreContracts.ts`
  - `src/services/firestore-schema-checklist.md`

## Data Shape Plan

### 1) `campus`

- Upsert `campus/main_campus` with:
  - `name`
  - `description`
  - `created_at`

### 2) `parking_areas`

- Upsert exactly 3 docs:
  - `area_A`
  - `area_B`
  - `motorcycle_area`
- Required fields:
  - `name`, `type`, `total_slots`, `available_slots`, `map_position`, `created_at`
- Include `bounds` from dataset for map click region support.

### 3) `parking_slots`

- Upsert exactly 52 docs generated from deterministic layout rules:
  - Area A: 20 car slots (`A1` to `A20`), base `(220,420)`, stepX `+50`, stepY `+70`, size `35x60`
  - Area B: 20 car slots (`B1` to `B20`), base `(600,340)`, stepX `+50`, stepY `+70`, size `35x60`
  - Motorcycle: 12 slots (`M1` to `M12`), base `(400,680)`, stepX `+40`, stepY `+60`, size `25x45`
- Slot fields:
  - `slot_id`, `area_id`, `slot_number`, `status`, `vehicle_type`, `position`, `last_updated`

## Coordinate & Relationship Rules

- Coordinates must remain normalized on 0–1000 grid.
- `position` will store `x`, `y`, `width`, `height` for renderer compatibility.
- `area_id` on each slot must reference one of seeded parking area docs.
- `available_slots` in each area must match computed count of seeded `status === 'available'` within that area.

## Status Distribution Strategy

- Target overall distribution aligned with sample dataset expectation:
  - `available`: 28
  - `occupied`: 24
- Deterministic assignment pattern (no randomness) so reruns are reproducible.

## Safety & Rerun Behavior

- Idempotent upsert strategy:
  - `setDoc(..., { merge: true })` for campus and parking areas.
  - `setDoc(..., { merge: true })` for each slot by stable document id (`slot_id`).
- No blanket collection deletion in default run.
- Optional cleanup mode can be added later if needed.

## Validation Targets After Seeding

- `campus` count: 1 (`main_campus`)
- `parking_areas` count: 3
- `parking_slots` count: 52
- Relationship checks:
  - all slot `area_id` values resolve to existing areas
- Distribution checks:
  - available = 28, occupied = 24
