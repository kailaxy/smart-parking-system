export const FIRESTORE_COLLECTIONS = {
  parkingAreas: 'parking_areas',
  parkingSlots: 'parking_slots',
} as const;

export const PARKING_AREA_TYPES = ['car', 'motorcycle', 'mixed'] as const;
export const SLOT_STATUS_VALUES = ['available', 'occupied'] as const;
export const SLOT_VEHICLE_TYPES = ['car', 'motorcycle'] as const;

export type ParkingAreaType = (typeof PARKING_AREA_TYPES)[number];
export type SlotStatus = (typeof SLOT_STATUS_VALUES)[number];
export type SlotVehicleType = (typeof SLOT_VEHICLE_TYPES)[number];
export type FirestoreTimestampLike =
  | Date
  | string
  | number
  | null
  | {
      seconds: number;
      nanoseconds?: number;
    };

export type Coordinate2D = {
  x: number;
  y: number;
};

export type SlotBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ParkingAreaDocument = {
  name: string;
  type: ParkingAreaType;
  total_slots: number;
  available_slots: number;
  map_position: Coordinate2D;
  bounds?: SlotBounds;
  created_at: FirestoreTimestampLike;
};

export type ParkingSlotDocument = {
  slot_id: string;
  area_id: string;
  slot_number: string;
  status: SlotStatus;
  vehicle_type: SlotVehicleType;
  position: SlotBounds;
  last_updated: FirestoreTimestampLike;
};

export type ParkingSlotDatasetShape = {
  slot_id: string;
  area_id: string;
  slot_number: string;
  status: SlotStatus;
  vehicle_type: SlotVehicleType;
  x: number;
  y: number;
  width: number;
  height: number;
  last_updated?: FirestoreTimestampLike;
};

export type ParkingAreaModel = {
  id: string;
  name: string;
  type: ParkingAreaType;
  totalSlots: number;
  availableSlots: number;
  mapPosition: Coordinate2D;
  bounds?: SlotBounds;
  createdAt: FirestoreTimestampLike;
};

export type ParkingSlotModel = {
  id: string;
  slotId: string;
  areaId: string;
  slotNumber: string;
  status: SlotStatus;
  vehicleType: SlotVehicleType;
  position: SlotBounds;
  lastUpdated: FirestoreTimestampLike;
};
