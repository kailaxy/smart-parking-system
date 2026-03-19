Parking Map Coordinate Guide – Smart Parking System
Overview

This document explains how to map parking slots and parking areas onto a campus map using coordinates.

The system uses a normalized coordinate system so that the layout works correctly across different screen sizes and devices.

Instead of storing pixel positions, we store relative coordinates (0–1000 grid).

This prevents scaling problems when the map resizes.

Core Concept

Each map is treated as a 1000 × 1000 virtual grid.

Example:

Top-left corner
(0,0)

Bottom-right corner
(1000,1000)

Every parking slot and parking area is placed using coordinates inside this grid.

Example slot:

{
  "slot_id": "A1",
  "x": 220,
  "y": 450
}

This means the slot is placed at:

22% across the map
45% down the map

The UI then converts this into screen pixels.

Why This Is Important

Phones have different screen sizes.

Examples:

Small phone
1080 × 1920

Tablet
1600 × 2560

Without normalized coordinates, slots would appear in the wrong positions.

Normalized coordinates ensure:

All devices display slots correctly.

Map Rendering Flow

Step 1

Load map image or SVG.

Step 2

Get screen size.

Example:

screenWidth = 1080
screenHeight = 1920

Step 3

Convert normalized coordinates to pixels.

Formula:

pixelX = (slotX / 1000) * mapWidth
pixelY = (slotY / 1000) * mapHeight

Example:

slotX = 220
slotY = 450

mapWidth = 1000px
mapHeight = 800px

Result:

pixelX = 220px
pixelY = 360px

Slot is drawn at that position.

Parking Area Coordinates

Parking areas are defined as rectangles on the campus map.

Example database entry:

{
  "area_id": "area_A",
  "name": "Parking Area A",
  "bounds": {
    "x": 150,
    "y": 300,
    "width": 200,
    "height": 150
  }
}

Meaning:

Top-left corner = (150,300)

Area width = 200
Area height = 150

This defines the clickable region.

Slot Coordinate Structure

Each slot should store:

slot_id
area_id
x
y
width
height
status
vehicle_type

Example:

{
  "slot_id": "A1",
  "area_id": "area_A",
  "x": 200,
  "y": 450,
  "width": 40,
  "height": 70,
  "status": "available"
}

This allows rendering a rectangle representing the parking slot.

Rendering Slots Using SVG

Recommended approach: SVG rendering

SVG scales naturally across devices.

Example slot rendering:

<Rect
 x={pixelX}
 y={pixelY}
 width={slotWidth}
 height={slotHeight}
 fill={slotColor}
/>

Slot color is determined by status.

Available → green
Occupied → red

Designing the Campus Map

Use a design tool such as:

Figma
Illustrator
Inkscape

Steps:

Import campus map image

Overlay a grid

Mark parking areas

Mark parking slot positions

Record coordinates

How to Find Coordinates (Easy Method)

In Figma:

Import campus map

Set frame size to 1000 × 1000

Place rectangles for parking slots

Read X and Y positions

Those values become your database coordinates.

Example:

Rectangle position:

X = 320
Y = 540

Database:

"x": 320,
"y": 540
Parking Slot Layout Example

Example layout for Parking Area A.

A1   A2   A3   A4

A5   A6   A7   A8

Coordinates example:

A1 → (200,400)
A2 → (260,400)
A3 → (320,400)
A4 → (380,400)

A5 → (200,480)
A6 → (260,480)
A7 → (320,480)
A8 → (380,480)
Click Detection

Slots should be clickable.

Touch detection works by checking if the tap falls inside slot boundaries.

Example logic:

if (
 tapX > slotX &&
 tapX < slotX + slotWidth &&
 tapY > slotY &&
 tapY < slotY + slotHeight
)

If true:

Open slot popup.

Performance Considerations

Avoid rendering thousands of slots at once.

Recommended:

Campus map → render parking areas only

Parking area screen → render slots

This keeps the UI smooth.

Map Zoom Strategy

Campus Screen

Shows only parking areas.

Parking Area Screen

Shows detailed slot layout.

This avoids excessive elements on one screen.

Future Sensor Integration

Later when sensors are added:

Sensor detects vehicle

↓

API updates slot status

↓

Firestore updates

↓

Slot color changes automatically

No change needed to coordinate system.

Common Mistakes to Avoid

Mistake 1

Using pixel coordinates tied to one device.

Problem:

Layout breaks on other devices.

Solution:

Use normalized coordinates.

Mistake 2

Hardcoding slot positions in code.

Problem:

Difficult to maintain.

Solution:

Store coordinates in database.

Mistake 3

Using raster images for slots.

Problem:

Poor scaling.

Solution:

Use SVG shapes.

Final Coordinate Model

All objects follow this rule:

Campus Map

↓

Parking Area Bounds

↓

Slot Coordinates

This hierarchy ensures scalable rendering and easy updates.

Summary

The system uses a normalized coordinate grid (0–1000).

Benefits:

Device independent
Scalable UI
Easy database mapping
Compatible with future sensor integration