# Firestore Schema Conformance Checklist

This checklist aligns implementation contracts to `database-schema.md` and `sample-dataset.md`.

## Collections

- [ ] `campus`
- [ ] `parking_areas`
- [ ] `parking_slots`
- [ ] `admins`

## `campus` Document (`campus/main_campus`)

- [ ] `name` (string)
- [ ] `description` (string)
- [ ] `created_at` (timestamp-like)

## `parking_areas` Document

- [ ] `name` (string)
- [ ] `type` (string enum: `car | motorcycle | mixed`)
- [ ] `total_slots` (number)
- [ ] `available_slots` (number)
- [ ] `map_position` (object with numeric `x`, `y`)
- [ ] `created_at` (timestamp-like)
- [ ] Optional dataset extension: `bounds` (object with numeric `x`, `y`, `width`, `height`)

## `parking_slots` Document

Required schema fields:

- [ ] `slot_id` (string)
- [ ] `area_id` (string)
- [ ] `slot_number` (string)
- [ ] `status` (string enum: `available | occupied`)
- [ ] `vehicle_type` (string enum: `car | motorcycle`)
- [ ] `position` (object with numeric `x`, `y`)
- [ ] `last_updated` (timestamp-like)

Accepted prototype/dataset shape handled by mapper:

- [ ] Flat coordinates: numeric `x`, `y`, `width`, `height`
- [ ] Optional `last_updated` (mapper fills fallback timestamp when absent)

## `admins` Document

- [ ] `name` (string)
- [ ] `email` (string)
- [ ] `role` (string)
- [ ] `created_at` (timestamp-like)

## Value Set Conformance

- [ ] Parking area `type` values restricted to: `car`, `motorcycle`, `mixed`
- [ ] Slot `status` values restricted to: `available`, `occupied`
- [ ] Slot `vehicle_type` values restricted to: `car`, `motorcycle`