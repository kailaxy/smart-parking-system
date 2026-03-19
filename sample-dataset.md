# Sample Dataset – Smart Parking System

## Overview

This document provides a **sample dataset** for the Smart Parking System prototype.

It includes:

* 1 campus
* 3 parking areas
* 52 parking slots

This dataset allows developers to **populate Firebase Firestore quickly** and test the application UI.

All coordinates follow the **normalized 0–1000 coordinate system** defined in the coordinate guide.

---

# Campus Collection

Collection: `campus`

Document ID: `main_campus`

```
{
  "name": "Sample University Campus",
  "description": "Prototype campus for smart parking system",
  "created_at": "2026-01-01T08:00:00Z"
}
```

---

# Parking Areas Collection

Collection: `parking_areas`

---

## Parking Area A

Document ID: `area_A`

```
{
  "name": "Parking Area A",
  "type": "car",
  "total_slots": 20,
  "available_slots": 12,
  "map_position": {
    "x": 220,
    "y": 420
  },
  "bounds": {
    "x": 200,
    "y": 380,
    "width": 240,
    "height": 200
  },
  "created_at": "2026-01-01T08:00:00Z"
}
```

---

## Parking Area B

Document ID: `area_B`

```
{
  "name": "Parking Area B",
  "type": "car",
  "total_slots": 20,
  "available_slots": 9,
  "map_position": {
    "x": 620,
    "y": 360
  },
  "bounds": {
    "x": 580,
    "y": 320,
    "width": 260,
    "height": 200
  },
  "created_at": "2026-01-01T08:00:00Z"
}
```

---

## Motorcycle Parking

Document ID: `motorcycle_area`

```
{
  "name": "Motorcycle Parking",
  "type": "motorcycle",
  "total_slots": 12,
  "available_slots": 7,
  "map_position": {
    "x": 420,
    "y": 700
  },
  "bounds": {
    "x": 380,
    "y": 660,
    "width": 200,
    "height": 160
  },
  "created_at": "2026-01-01T08:00:00Z"
}
```

---

# Parking Slots Collection

Collection: `parking_slots`

---

# Parking Area A Slots

20 slots arranged in a grid.

```
A1   A2   A3   A4   A5
A6   A7   A8   A9   A10
A11  A12  A13  A14  A15
A16  A17  A18  A19  A20
```

Example slots:

```
{
  "slot_id": "A1",
  "area_id": "area_A",
  "slot_number": "A1",
  "x": 220,
  "y": 420,
  "width": 35,
  "height": 60,
  "status": "available",
  "vehicle_type": "car"
}
```

```
{
  "slot_id": "A2",
  "area_id": "area_A",
  "slot_number": "A2",
  "x": 270,
  "y": 420,
  "width": 35,
  "height": 60,
  "status": "occupied",
  "vehicle_type": "car"
}
```

```
{
  "slot_id": "A3",
  "area_id": "area_A",
  "slot_number": "A3",
  "x": 320,
  "y": 420,
  "width": 35,
  "height": 60,
  "status": "available",
  "vehicle_type": "car"
}
```

Continue pattern for remaining slots:

Row spacing: +70 Y
Column spacing: +50 X

Example row 2:

```
A6  → x:220 y:490
A7  → x:270 y:490
A8  → x:320 y:490
A9  → x:370 y:490
A10 → x:420 y:490
```

---

# Parking Area B Slots

20 slots.

Layout:

```
B1   B2   B3   B4   B5
B6   B7   B8   B9   B10
B11  B12  B13  B14  B15
B16  B17  B18  B19  B20
```

Starting coordinate:

```
B1 → x:600 y:340
```

Spacing rules:

Column spacing: +50
Row spacing: +70

Example:

```
{
  "slot_id": "B1",
  "area_id": "area_B",
  "slot_number": "B1",
  "x": 600,
  "y": 340,
  "width": 35,
  "height": 60,
  "status": "occupied",
  "vehicle_type": "car"
}
```

```
{
  "slot_id": "B2",
  "area_id": "area_B",
  "slot_number": "B2",
  "x": 650,
  "y": 340,
  "width": 35,
  "height": 60,
  "status": "available",
  "vehicle_type": "car"
}
```

---

# Motorcycle Slots

12 slots.

Layout:

```
M1  M2  M3  M4
M5  M6  M7  M8
M9  M10 M11 M12
```

Start coordinate:

```
M1 → x:400 y:680
```

Spacing:

Column: +40
Row: +60

Example:

```
{
  "slot_id": "M1",
  "area_id": "motorcycle_area",
  "slot_number": "M1",
  "x": 400,
  "y": 680,
  "width": 25,
  "height": 45,
  "status": "available",
  "vehicle_type": "motorcycle"
}
```

---

# Example Status Distribution

For testing UI:

Available slots: ~28
Occupied slots: ~24

This ensures both colors appear on the map.

---

# Example Firestore Import Strategy

Developers can:

1. Create collections manually in Firebase console

or

2. Use Firebase Admin SDK script to seed data.

Pseudo steps:

```
connect to firestore
create campus document
create parking_areas documents
loop through slot data
insert parking_slots documents
```

---

# Expected UI Result

Campus Map Screen

Shows:

Parking Area A
Parking Area B
Motorcycle Parking

Each displays available slot count.

---

Parking Area Screen

Displays colored slots:

🟢 Available
🔴 Occupied

Users can tap slots to view details.

---

# Dataset Summary

Campus: 1

Parking Areas: 3

Total Slots: 52

Car Slots: 40

Motorcycle Slots: 12
