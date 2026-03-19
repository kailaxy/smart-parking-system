# Smart Parking System – Database Schema

## Overview

This document defines the database structure for the Smart Parking System prototype.

The system uses **Firebase Firestore** as the primary database.

Firestore is chosen because it supports:
- Real-time updates
- Flexible schema
- Simple integration with mobile apps

All parking availability updates propagate in real-time to connected clients.

---

# Database Structure

Firestore Collections:

campus  
parking_areas  
parking_slots  
admins  

---

# 1. campus Collection

Stores general campus information.

Example document:

campus/main_campus

Fields:

name: string  
description: string  
created_at: timestamp  

Example:

{
  "name": "University Campus",
  "description": "Main campus parking system",
  "created_at": timestamp
}

---

# 2. parking_areas Collection

Each document represents a parking area within the campus.

Example:

parking_areas/area_A

Fields:

name: string  
type: string  
total_slots: number  
available_slots: number  
map_position: object  
created_at: timestamp  

Field description:

name  
Human-readable parking area name

type  
Type of parking allowed  
Possible values:
- car
- motorcycle
- mixed

total_slots  
Total number of parking slots

available_slots  
Number of currently available slots

map_position  
Coordinates used to display area on the campus map

Example document:

{
  "name": "Parking Area A",
  "type": "car",
  "total_slots": 40,
  "available_slots": 15,
  "map_position": {
    "x": 120,
    "y": 240
  },
  "created_at": timestamp
}

---

# 3. parking_slots Collection

Each document represents a specific parking slot.

Example:

parking_slots/A1

Fields:

slot_id: string  
area_id: string  
slot_number: string  
status: string  
vehicle_type: string  
position: object  
last_updated: timestamp  

Field description:

slot_id  
Unique identifier for slot

area_id  
Reference to parking area

slot_number  
Display name for slot

status  
Current slot availability

Possible values:
- available
- occupied

vehicle_type  
Type of vehicle allowed

Possible values:
- car
- motorcycle

position  
Coordinates used to render slot on area map

last_updated  
Timestamp of last update

Example document:

{
  "slot_id": "A1",
  "area_id": "area_A",
  "slot_number": "A1",
  "status": "available",
  "vehicle_type": "car",
  "position": {
    "x": 20,
    "y": 40
  },
  "last_updated": timestamp
}

---

# 4. admins Collection

Stores administrator accounts for dashboard access.

Example:

admins/admin_001

Fields:

name: string  
email: string  
role: string  
created_at: timestamp  

Example document:

{
  "name": "Parking Admin",
  "email": "admin@campus.edu",
  "role": "administrator",
  "created_at": timestamp
}

---

# Relationships

parking_areas → parking_slots

One parking area contains multiple parking slots.

Relationship example:

area_A
 ├─ A1
 ├─ A2
 ├─ A3
 └─ A4

---

# Real-Time Update Behavior

When a parking slot changes status:

1. Admin updates slot document
2. Firestore triggers real-time update
3. Mobile app listener updates UI

Example flow:

Admin Dashboard  
↓  
Firestore Update  
↓  
Mobile App Listener  
↓  
Slot Color Update

---

# Slot Status Update Example

Update slot A1:

{
  "status": "occupied",
  "last_updated": timestamp
}

Firestore automatically syncs the change to all clients.

---

# Future Expansion (Sensor Integration)

When sensors or computer vision are added later:

Instead of admin input:

Sensors → API → Firestore update

Example pipeline:

Ultrasonic Sensor  
Camera Vision  
↓  
Backend API  
↓  
Firestore  
↓  
Mobile App