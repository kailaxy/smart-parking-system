# Smart Parking System – Application Architecture

## Overview

This document defines the project architecture for the Smart Parking System prototype.

The application consists of:

1. Mobile Application
2. Admin Dashboard
3. Cloud Backend (Firebase)

The system follows a **client-cloud architecture**.

---

# System Architecture Diagram

Mobile App
    ↓
Firebase Firestore
    ↓
Admin Dashboard

All updates flow through Firestore.

---

# Mobile Application

Platform:

React Native (Expo)

Purpose:

Allows users to view campus parking availability.

---

# Mobile App Folder Structure

src/

components/  
screens/  
navigation/  
services/  
hooks/  
utils/  
assets/

---

# Component Structure

components/

ParkingSlot.tsx  
ParkingArea.tsx  
CampusMap.tsx  
SlotPopup.tsx  

Component descriptions:

ParkingSlot

Renders individual parking slot.

Properties:

slotId  
status  
vehicleType  
position  

ParkingArea

Displays parking area on campus map.

CampusMap

Displays the entire campus layout.

SlotPopup

Shows slot information when user taps slot.

---

# Screens

screens/

CampusMapScreen.tsx  
ParkingAreaScreen.tsx  
SlotDetailScreen.tsx  

Screen descriptions:

CampusMapScreen

Main landing screen.

Displays campus map and parking areas.

ParkingAreaScreen

Displays zoomed view of a specific parking area.

Shows individual slots.

SlotDetailScreen

Popup or modal showing slot information.

---

# Navigation

navigation/

AppNavigator.tsx

Handles screen navigation using React Navigation.

Flow:

CampusMapScreen  
↓  
ParkingAreaScreen  
↓  
SlotDetailScreen

---

# Services

services/

firebase.ts  
parkingService.ts  

firebase.ts

Initializes Firebase connection.

parkingService.ts

Handles database operations.

Functions:

getParkingAreas()

getSlotsByArea(areaId)

updateSlotStatus(slotId, status)

listenToSlotUpdates(callback)

---

# Hooks

hooks/

useParkingAreas.ts  
useParkingSlots.ts  

These hooks subscribe to Firestore updates.

Example usage:

useParkingSlots(areaId)

Returns:

list of slots  
real-time updates

---

# Utilities

utils/

colorUtils.ts  
mapUtils.ts  

colorUtils.ts

Maps slot status to colors.

Example:

available → green  
occupied → red

mapUtils.ts

Handles coordinate transformations for SVG rendering.

---

# Admin Dashboard

Platform:

React Web Application

Purpose:

Allows administrators to manually update slot status.

---

# Admin Dashboard Features

View parking areas  
View slots within areas  
Toggle slot availability  
Reset area status  

---

# Admin Dashboard Folder Structure

admin/

components/  
pages/  
services/

---

# Data Flow

Admin changes slot status.

Example:

Admin clicks slot A1

↓

Firestore update

↓

Mobile app receives update

↓

UI updates automatically

---

# State Management

Recommended approach:

React Context or Zustand.

State includes:

parkingAreas  
parkingSlots  
selectedArea  
selectedSlot

---

# UI Rendering System

Maps are rendered using SVG.

Example slot rendering:

Rectangle elements represent parking slots.

Slot color reflects availability.

Example:

green → available  
red → occupied

---

# Animation System

Recommended library:

react-native-reanimated

Animations:

Campus → Area zoom  
Slot color transitions  
Popup animations

---

# Error Handling

Common scenarios:

Firestore connection failure  
Invalid slot updates  
Admin authentication errors

Implement fallback UI states.

---

# Security

Admin dashboard must require authentication.

Use:

Firebase Authentication

Only authenticated admins can update slots.

---

# Future Architecture Expansion

Later versions may include:

IoT Sensors  
Computer Vision  
Parking Prediction AI

Future architecture:

Sensors  
↓  
Edge Processing  
↓  
Backend API  
↓  
Firestore  
↓  
Mobile App