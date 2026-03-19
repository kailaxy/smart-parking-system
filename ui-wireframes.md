UI Wireframes – Smart Parking System
# Smart Parking System – UI Wireframes

## Overview

This document defines the UI layout and interaction flow for the Smart Parking System mobile application.

The UI is composed of three main screens:

1. Campus Map Screen
2. Parking Area Screen
3. Slot Detail Popup

These screens allow users to navigate from a **campus overview** to **parking areas** and finally to **individual parking slots**.

The design prioritizes:

- clarity
- fast parking discovery
- intuitive navigation
- minimal taps

---

# Color System

Slot colors must follow a consistent color system.

Available Slot  
Green

Occupied Slot  
Red

Motorcycle Slot  
Yellow

Disabled Slot  
Gray

Example mapping:

available → #22c55e  
occupied → #ef4444  
motorcycle → #facc15  
disabled → #9ca3af  

---

# Screen 1 – Campus Map Screen

## Purpose

Shows the **entire campus layout** and allows users to see parking area availability at a glance.

---

## Layout

Top Navigation Bar

Smart Parking  
Search Icon (optional)

---

Main Map Area

Campus Map Image or SVG

Parking areas are rendered as **interactive zones**.

Example wireframe:

| Smart Parking |
     CAMPUS MAP

  [ Building A ]

🟢 Parking Area A
🟡 Motorcycle Parking

  [ Building B ]

🔴 Parking Area B

| Bottom Navigation / Info Bar |

---

## Parking Area Element

Each parking area must display:

Area Name  
Available Slots / Total Slots  
Color Status Indicator

Example:


Parking Area A
15 / 40 available


Color is determined by availability percentage.

Suggested thresholds:

0–25% available → red  
25–50% available → yellow  
50–100% available → green  

---

## Interaction

User taps parking area.

Action:

Zoom animation → open Parking Area Screen.

---

# Screen 2 – Parking Area Screen

## Purpose

Displays the **detailed layout of a specific parking lot** with individual parking slots.

---

## Layout

Header

Back Button  
Parking Area Name

Example:


< Back Parking Area A


---

Main Map Area

SVG layout of parking slots.

Example wireframe:

| < Back Parking Area A |

SLOT MAP

[A1] [A2] [A3] [A4]

[B1] [B2] [B3] [B4]

[C1] [C2] [C3] [C4]

| Legend |
| 🟢 Available |
| 🔴 Occupied |
| 🟡 Motorcycle |

---

## Parking Slot Component

Each slot is an interactive rectangle.

Properties:

slot_id  
status  
vehicle_type  
position  

Example display:


[A1] green
[A2] red
[A3] green


---

## Slot Interaction

When user taps slot:

Open **Slot Detail Popup**.

---

# Screen 3 – Slot Detail Popup

## Purpose

Displays detailed information about a selected slot.

---

## Layout

Popup Modal

Slot A2

Vehicle Type: Car

Status: Occupied

Last Updated:
3:45 PM

[ Close ]


---

## Popup Behavior

Popup appears centered.

Background should dim slightly.

Close options:

Tap close button  
Tap outside popup  

---

# Navigation Flow

User interaction flow:

App Launch

↓

Campus Map Screen

↓

User taps parking area

↓

Zoom Animation

↓

Parking Area Screen

↓

User taps slot

↓

Slot Detail Popup

---

# Zoom Animation

When user taps parking area:

1. Map zooms toward area
2. Area expands to full screen
3. Parking Area Screen loads

Recommended animation duration:

300–500 ms

---

# Slot Update Behavior

When a slot status changes:

1. Firestore update occurs
2. App receives update
3. Slot color transitions smoothly

Example transition:

green → red

Animation duration:

200 ms fade transition

---

# Empty State

If no parking slots exist:

Display message:


No parking slots found.


---

# Loading State

When data is loading:

Display loading indicator.

Example:


Loading parking information...


---

# Error State

If data cannot be retrieved:

Display message:


Unable to load parking data.
Please try again.


---

# Accessibility

Text must remain readable on all slot colors.

Minimum contrast ratio:

4.5:1

Slot labels must remain visible.

---

# Future UI Extensions

Possible additional screens:

Parking Reservation Screen  
Parking History Screen  
User Profile Screen  
Notifications Screen

These features are not part of the prototype but the architecture should allow them.

---

# UI Summary

The UI consists of three layers:

Campus Map  
↓  
Parking Area Map  
↓  
Slot Detail Popup

This layered navigation allows users to quickly identify parking availability and drill down to specific parking slots.