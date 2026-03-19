import {
  Coordinate2D,
  PARKING_AREA_TYPES,
  SLOT_STATUS_VALUES,
  SLOT_VEHICLE_TYPES,
  FirestoreTimestampLike,
  ParkingAreaDocument,
  ParkingAreaModel,
  ParkingSlotDatasetShape,
  ParkingSlotDocument,
  ParkingSlotModel,
  SlotBounds,
} from './firestoreContracts';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const readString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid or missing string field: ${fieldName}`);
  }

  return value;
};

const readNumber = (value: unknown, fieldName: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid or missing numeric field: ${fieldName}`);
  }

  return value;
};

const readEnum = <T extends readonly string[]>(value: unknown, accepted: T, fieldName: string): T[number] => {
  if (typeof value !== 'string' || !accepted.includes(value)) {
    throw new Error(`Invalid field value for ${fieldName}. Accepted: ${accepted.join(', ')}`);
  }

  return value as T[number];
};

const readTimestampLike = (value: unknown, fieldName: string): FirestoreTimestampLike => {
  if (value === null || value === undefined) {
    throw new Error(`Invalid or missing timestamp-like field: ${fieldName}`);
  }

  return value as FirestoreTimestampLike;
};

const readBounds = (value: unknown, fieldPrefix: string): SlotBounds => {
  if (!isRecord(value)) {
    throw new Error(`Invalid or missing object field: ${fieldPrefix}`);
  }

  return {
    x: readNumber(value.x, `${fieldPrefix}.x`),
    y: readNumber(value.y, `${fieldPrefix}.y`),
    width: readNumber(value.width, `${fieldPrefix}.width`),
    height: readNumber(value.height, `${fieldPrefix}.height`),
  };
};

const readCoordinate = (value: unknown, fieldPrefix: string): Coordinate2D => {
  if (!isRecord(value)) {
    throw new Error(`Invalid or missing object field: ${fieldPrefix}`);
  }

  return {
    x: readNumber(value.x, `${fieldPrefix}.x`),
    y: readNumber(value.y, `${fieldPrefix}.y`),
  };
};

const mapPositionToBounds = (position: unknown): SlotBounds => {
  if (!isRecord(position)) {
    throw new Error('Invalid or missing object field: position');
  }

  return {
    x: readNumber(position.x, 'position.x'),
    y: readNumber(position.y, 'position.y'),
    width: typeof position.width === 'number' ? position.width : 35,
    height: typeof position.height === 'number' ? position.height : 60,
  };
};

export const mapParkingAreaDocument = (documentId: string, raw: unknown): ParkingAreaModel => {
  if (!isRecord(raw)) {
    throw new Error('Invalid parking_areas document payload');
  }

  const mapped: ParkingAreaDocument = {
    name: readString(raw.name, 'name'),
    type: readEnum(raw.type, PARKING_AREA_TYPES, 'type'),
    total_slots: readNumber(raw.total_slots, 'total_slots'),
    available_slots: readNumber(raw.available_slots, 'available_slots'),
    map_position: readCoordinate(raw.map_position, 'map_position'),
    bounds: raw.bounds ? readBounds(raw.bounds, 'bounds') : undefined,
    created_at: readTimestampLike(raw.created_at, 'created_at'),
  };

  return {
    id: documentId,
    name: mapped.name,
    type: mapped.type,
    totalSlots: mapped.total_slots,
    availableSlots: mapped.available_slots,
    mapPosition: mapped.map_position,
    bounds: mapped.bounds,
    createdAt: mapped.created_at,
  };
};

export const mapParkingSlotDocument = (documentId: string, raw: unknown): ParkingSlotModel => {
  if (!isRecord(raw)) {
    throw new Error('Invalid parking_slots document payload');
  }

  const status = readEnum(raw.status, SLOT_STATUS_VALUES, 'status');
  const vehicleType = readEnum(raw.vehicle_type, SLOT_VEHICLE_TYPES, 'vehicle_type');

  if (raw.position) {
    const mapped: ParkingSlotDocument = {
      slot_id: readString(raw.slot_id, 'slot_id'),
      area_id: readString(raw.area_id, 'area_id'),
      slot_number: readString(raw.slot_number, 'slot_number'),
      status,
      vehicle_type: vehicleType,
      position: mapPositionToBounds(raw.position),
      last_updated: readTimestampLike(raw.last_updated, 'last_updated'),
    };

    return {
      id: documentId,
      slotId: mapped.slot_id,
      areaId: mapped.area_id,
      slotNumber: mapped.slot_number,
      status: mapped.status,
      vehicleType: mapped.vehicle_type,
      position: mapped.position,
      lastUpdated: mapped.last_updated,
    };
  }

  const datasetShape: ParkingSlotDatasetShape = {
    slot_id: readString(raw.slot_id, 'slot_id'),
    area_id: readString(raw.area_id, 'area_id'),
    slot_number: readString(raw.slot_number, 'slot_number'),
    status,
    vehicle_type: vehicleType,
    x: readNumber(raw.x, 'x'),
    y: readNumber(raw.y, 'y'),
    width: readNumber(raw.width, 'width'),
    height: readNumber(raw.height, 'height'),
    last_updated: (raw.last_updated ?? new Date().toISOString()) as FirestoreTimestampLike,
  };

  return {
    id: documentId,
    slotId: datasetShape.slot_id,
    areaId: datasetShape.area_id,
    slotNumber: datasetShape.slot_number,
    status: datasetShape.status,
    vehicleType: datasetShape.vehicle_type,
    position: {
      x: datasetShape.x,
      y: datasetShape.y,
      width: datasetShape.width,
      height: datasetShape.height,
    },
    lastUpdated: datasetShape.last_updated ?? new Date().toISOString(),
  };
};
