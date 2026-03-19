import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from './firebase';
import { FIRESTORE_COLLECTIONS, ParkingAreaModel, ParkingSlotModel, SLOT_STATUS_VALUES, SlotStatus } from './firestoreContracts';
import { mapParkingAreaDocument, mapParkingSlotDocument } from './firestoreMappers';

export type ParkingServiceErrorCode = 'invalid-argument' | 'not-found' | 'permission-denied' | 'unavailable' | 'unknown';

export type ParkingServiceError = {
  code: ParkingServiceErrorCode;
  message: string;
  cause?: unknown;
};

export type ParkingServiceResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: ParkingServiceError;
    };

export type SlotUpdatesCallback = (slots: ParkingSlotModel[]) => void;
export type UnsubscribeListener = () => void;

export interface ParkingService {
  getParkingAreas: () => Promise<ParkingServiceResult<ParkingAreaModel[]>>;
  getSlotsByArea: (areaId: string) => Promise<ParkingServiceResult<ParkingSlotModel[]>>;
  listenToSlotUpdates: (callback: SlotUpdatesCallback) => UnsubscribeListener;
  updateSlotStatus: (slotId: string, status: SlotStatus) => Promise<ParkingServiceResult<ParkingSlotModel>>;
}

const toServiceError = (error: unknown, fallbackMessage: string): ParkingServiceError => {
  const firebaseCode = (error as { code?: string })?.code;
  if (firebaseCode === 'permission-denied') {
    return {
      code: 'permission-denied',
      message: 'Access denied when reading Firestore data',
      cause: error,
    };
  }

  if (firebaseCode === 'unavailable') {
    return {
      code: 'unavailable',
      message: 'Firestore service is temporarily unavailable',
      cause: error,
    };
  }

  if (firebaseCode === 'not-found') {
    return {
      code: 'not-found',
      message: fallbackMessage,
      cause: error,
    };
  }

  return {
    code: 'unknown',
    message: fallbackMessage,
    cause: error,
  };
};

export const getParkingAreas: ParkingService['getParkingAreas'] = async () => {
  try {
    const snapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.parkingAreas));
    const data = snapshot.docs
      .map((item) => mapParkingAreaDocument(item.id, item.data()))
      .sort((left, right) => left.name.localeCompare(right.name));

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: toServiceError(error, 'Failed to fetch parking areas'),
    };
  }
};

export const getSlotsByArea: ParkingService['getSlotsByArea'] = async (areaId) => {
  const normalizedAreaId = areaId.trim();

  if (!normalizedAreaId) {
    return {
      ok: false,
      error: {
        code: 'invalid-argument',
        message: 'areaId is required',
      },
    };
  }

  try {
    const slotsQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.parkingSlots),
      where('area_id', '==', normalizedAreaId),
    );

    const snapshot = await getDocs(slotsQuery);
    const data = snapshot.docs
      .map((item) => mapParkingSlotDocument(item.id, item.data()))
      .sort((left, right) => left.slotNumber.localeCompare(right.slotNumber, undefined, { numeric: true }));

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: toServiceError(error, 'Failed to fetch parking slots for area'),
    };
  }
};

export const listenToSlotUpdates: ParkingService['listenToSlotUpdates'] = (callback) => {
  if (typeof callback !== 'function') {
    return () => undefined;
  }

  const unsubscribe = onSnapshot(
    collection(db, FIRESTORE_COLLECTIONS.parkingSlots),
    (snapshot) => {
      const slots: ParkingSlotModel[] = [];

      snapshot.forEach((item) => {
        try {
          slots.push(mapParkingSlotDocument(item.id, item.data()));
        } catch (mappingError) {
          console.error('[mobile parkingService] skipped invalid slot document', {
            id: item.id,
            error: mappingError,
          });
        }
      });

      callback(slots.sort((left, right) => left.slotNumber.localeCompare(right.slotNumber, undefined, { numeric: true })));
    },
    (error) => {
      console.error('[mobile parkingService] listenToSlotUpdates failed', toServiceError(error, 'Failed to listen for slot updates'));
    },
  );

  return () => {
    unsubscribe();
  };
};

export const updateSlotStatus: ParkingService['updateSlotStatus'] = async (slotId, status) => {
  const normalizedSlotId = slotId.trim();

  if (!normalizedSlotId) {
    return {
      ok: false,
      error: {
        code: 'invalid-argument',
        message: 'slotId is required',
      },
    };
  }

  if (!SLOT_STATUS_VALUES.includes(status)) {
    return {
      ok: false,
      error: {
        code: 'invalid-argument',
        message: `Invalid status value. Accepted: ${SLOT_STATUS_VALUES.join(', ')}`,
      },
    };
  }

  try {
    const slotRef = doc(db, FIRESTORE_COLLECTIONS.parkingSlots, normalizedSlotId);
    const currentSlotSnapshot = await getDoc(slotRef);

    if (!currentSlotSnapshot.exists()) {
      return {
        ok: false,
        error: {
          code: 'not-found',
          message: `Slot not found: ${normalizedSlotId}`,
        },
      };
    }

    const currentSlotData = currentSlotSnapshot.data();
    const areaId = currentSlotData?.area_id as string | undefined;
    const previousStatus = currentSlotData?.status as SlotStatus | undefined;

    if (!areaId) {
      return {
        ok: false,
        error: {
          code: 'invalid-argument',
          message: 'Slot document missing area_id field',
        },
      };
    }

    await updateDoc(slotRef, {
      status,
      last_updated: serverTimestamp(),
    });

    if (previousStatus && previousStatus !== status) {
      const delta = previousStatus === 'available' && status === 'occupied' ? -1 : 1;
      const areaRef = doc(db, FIRESTORE_COLLECTIONS.parkingAreas, areaId);
      await updateDoc(areaRef, {
        available_slots: increment(delta),
      });
    }

    const updatedSnapshot = await getDoc(slotRef);
    if (!updatedSnapshot.exists()) {
      return {
        ok: false,
        error: {
          code: 'not-found',
          message: `Slot not found after update: ${normalizedSlotId}`,
        },
      };
    }

    return {
      ok: true,
      data: mapParkingSlotDocument(updatedSnapshot.id, updatedSnapshot.data()),
    };
  } catch (error) {
    return {
      ok: false,
      error: toServiceError(error, 'Failed to update slot status'),
    };
  }
};

export type ConsistencyCheckResult =
  | {
      ok: true;
      issues: string[];
      slotCount: number;
      areaCount: number;
    }
  | {
      ok: false;
      error: ParkingServiceError;
    };

export const validateDataConsistency = async (): Promise<ConsistencyCheckResult> => {
  try {
    const areasResult = await getParkingAreas();
    if (!areasResult.ok) {
      return { ok: false, error: areasResult.error };
    }

    const issues: string[] = [];
    let totalSlots = 0;

    for (const area of areasResult.data) {
      const slotsResult = await getSlotsByArea(area.id);
      if (!slotsResult.ok) {
        issues.push(`Area "${area.name}" (${area.id}): ${slotsResult.error.message}`);
        continue;
      }

      const slots = slotsResult.data;
      totalSlots += slots.length;

      if (slots.length !== area.totalSlots) {
        issues.push(`Area "${area.name}": Expected ${area.totalSlots} slots but found ${slots.length}`);
      }

      const available = slots.filter((slot) => slot.status === 'available').length;
      if (available !== area.availableSlots) {
        issues.push(`Area "${area.name}": available_slots mismatch. Expected ${area.availableSlots} but found ${available}`);
      }
    }

    return {
      ok: true,
      issues,
      slotCount: totalSlots,
      areaCount: areasResult.data.length,
    };
  } catch (error) {
    return {
      ok: false,
      error: toServiceError(error, 'Data consistency validation failed'),
    };
  }
};

export const parkingService: ParkingService = {
  getParkingAreas,
  getSlotsByArea,
  listenToSlotUpdates,
  updateSlotStatus,
};
