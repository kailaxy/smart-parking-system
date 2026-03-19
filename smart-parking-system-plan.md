Smart Parking System – Technical Implementation Plan (Prototype Version)
1. Project Overview

This project implements a Smart Parking System for a school campus that allows users to view parking availability through an interactive map-based mobile application.

The system displays the campus layout, parking areas, and individual parking slots with real-time availability updates.

For the initial prototype, parking slot status will be updated manually through an admin interface rather than through sensors or computer vision.

The system is designed so that hardware sensors and computer vision can be added later without changing the core architecture.

Smart parking systems typically follow a layered architecture where users interact through an application layer that communicates availability data through a backend service.

2. System Goals
Primary Goals

Provide a visual overview of campus parking availability

Allow users to zoom into parking areas

Display slot-level availability

Provide real-time updates to all users

Provide an admin interface for manual parking updates

Secondary Goals

Clean, intuitive UI

Scalable architecture

Easy upgrade path for IoT sensors and AI detection

Modular system design

3. System Architecture

The system has three primary components.

Mobile App (User Interface)
        ↓
Backend API + Database
        ↓
Admin Dashboard (Manual Slot Control)
Component Description
Component	Purpose
Mobile App	User-facing parking map
Backend Server	Handles data storage and updates
Admin Dashboard	Allows manual slot status updates
4. Technology Stack
Mobile Application

Framework:

React Native (Expo)

Libraries:

Library	Purpose
react-native-svg	Interactive parking maps
react-native-reanimated	Map zoom animations
Firebase SDK	Database integration
Axios	Backend API communication
Backend

Platform:

Firebase

Services Used:

Service	Purpose
Firestore	Real-time database
Firebase Authentication	Admin login
Firebase Hosting	Admin dashboard hosting

Firestore is used because it supports real-time data synchronization, allowing parking slot updates to appear instantly in the mobile app.

Admin Dashboard

Framework options:

React Web App
or
Simple Firebase Admin Panel

Features:

Update slot availability

View parking areas

Toggle slot status

5. Data Model
Firestore Collections
campus
parking_areas
parking_slots
Parking Areas Collection

Example:

parking_areas
    area_A
        name: "Parking Area A"
        type: "car"
        total_slots: 40
        available_slots: 15
        location: {
            x: 120,
            y: 240
        }

Fields:

Field	Description
name	Name of parking area
type	Vehicle type
total_slots	Number of slots
available_slots	Current availability
location	Position on campus map
Parking Slots Collection

Example:

parking_slots
    A1
        area_id: area_A
        slot_number: A1
        status: available
        vehicle_type: car
        last_updated: timestamp

Fields:

Field	Description
area_id	Parking area reference
slot_number	Slot identifier
status	available / occupied
vehicle_type	car / motorcycle
last_updated	Last update time
6. Map Hierarchy System

The application uses three levels of map interaction.

Campus Map
    ↓
Parking Area Map
    ↓
Slot Map
7. Level 1 – Campus Overview Map

The first screen shows the entire school campus layout.

Parking areas appear as clickable zones.

Example concept:

Campus Map

Building A
Building B

🟢 Parking Area A
🟡 Motorcycle Parking
🔴 Parking Area B

Color legend:

Color	Meaning
Green	Many slots available
Yellow	Moderate availability
Red	Nearly full

Each area displays:

Parking Area A
15 / 40 available

When the user taps a parking area, the system performs a zoom animation.

8. Level 2 – Parking Area Map

After selecting a parking area, the user sees the layout of that parking lot.

Example layout:

[A1] [A2] [A3] [A4]
[B1] [B2] [B3] [B4]
[C1] [C2] [C3] [C4]

Slot colors:

Color	Meaning
Green	Available
Red	Occupied
Yellow	Motorcycle slot
Gray	Disabled

Each slot is an interactive element.

9. Level 3 – Slot Interaction

When the user taps a slot, a popup appears:

Slot A2
Vehicle Type: Car
Status: Occupied
Last Updated: 3:45 PM

Future features may include:

Reserve slot

Navigation to slot

Parking timer

10. Interactive Map Implementation

Maps will be built using SVG layouts.

Each parking slot will be an SVG object.

Example concept:

<Rect
 x="20"
 y="40"
 width="50"
 height="90"
 fill={slotColor}
 onPress={() => openSlotInfo("A1")}
/>

Advantages:

Fully interactive

Easily scalable

Lightweight rendering

11. Real-Time Data Flow

System update flow:

Admin Dashboard
      ↓
Firestore Database
      ↓
Mobile App Listener
      ↓
Map Updates Instantly

The mobile application listens for database updates and automatically updates slot colors.

12. Admin Dashboard Functionality

Admin dashboard provides manual control of slot availability.

Example interface:

Admin Panel

[A1] [A2] [A3]

Click Slot → Toggle Status

Toggle logic:

available → occupied
occupied → available

Optional admin tools:

Reset area availability

Bulk slot updates

View parking statistics

13. User Interface Flow
App Launch
     ↓
Campus Map
     ↓
Tap Parking Area
     ↓
Zoom Animation
     ↓
Parking Area Map
     ↓
Tap Slot
     ↓
Slot Info Popup
14. Animation System

Recommended animations:

Animation	Purpose
Map zoom	Transition between map levels
Slot color fade	Visual feedback on status change
Popup slide	Slot information display

Animations improve usability and system responsiveness.

15. Scalability for Future Sensor Integration

Although this version uses manual input, the architecture supports future hardware integration.

Future data pipeline:

Sensors / Camera
       ↓
Edge Device / API
       ↓
Backend Server
       ↓
Firestore
       ↓
Mobile App

Only the data input method changes, not the application architecture.

16. Development Roadmap
Phase 1

Design campus map layout

Phase 2

Design parking area slot maps

Phase 3

Setup Firebase project

Phase 4

Implement interactive campus map

Phase 5

Implement zoom animations

Phase 6

Create slot interaction system

Phase 7

Develop admin dashboard

Phase 8

Connect Firestore real-time updates

Phase 9

UI polish and testing

17. Final System Diagram
            Admin Dashboard
                  ↓
              Firestore
                  ↓
            Mobile App

Campus Map
     ↓
Parking Area
     ↓
Slot Map
18. Expected Features (Prototype Version)

The completed prototype will include:

Interactive campus map

Zoomable parking areas

Slot-level parking visualization

Real-time updates

Admin dashboard for manual control

Expandable architecture for IoT sensors