import { useEffect, useState } from 'react';
import { ParkingSlotModel, SlotStatus } from '../services/firestoreContracts';
import { getSlotsByArea, listenToSlotUpdates, ParkingServiceError, ParkingServiceResult, updateSlotStatus } from '../services/parkingService';

type UseParkingSlotsState = {
  slots: ParkingSlotModel[];
  isLoading: boolean;
  error: ParkingServiceError | null;
  isUpdatingSlot: boolean;
  toggleSlotStatus: (slotId: string, currentStatus: SlotStatus) => Promise<ParkingServiceResult<ParkingSlotModel>>;
};

export const useParkingSlots = (areaId: string | null): UseParkingSlotsState => {
  const [slots, setSlots] = useState<ParkingSlotModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingSlot, setIsUpdatingSlot] = useState(false);
  const [error, setError] = useState<ParkingServiceError | null>(null);

  const toggleSlotStatus: UseParkingSlotsState['toggleSlotStatus'] = async (slotId, currentStatus) => {
    const nextStatus: SlotStatus = currentStatus === 'available' ? 'occupied' : 'available';
    setIsUpdatingSlot(true);

    const result = await updateSlotStatus(slotId, nextStatus);

    if (result.ok) {
      setSlots((previous) => previous.map((slot) => (slot.id === slotId ? result.data : slot)));
      setError(null);
    } else {
      setError(result.error);
    }

    setIsUpdatingSlot(false);
    return result;
  };

  useEffect(() => {
    if (!areaId) {
      setSlots([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadInitial = async () => {
      const result = await getSlotsByArea(areaId);

      if (!isMounted) {
        return;
      }

      if (!result.ok) {
        setSlots([]);
        setError(result.error);
        setIsLoading(false);
        return;
      }

      setSlots(result.data);
      setIsLoading(false);
    };

    void loadInitial();

    const unsubscribe = listenToSlotUpdates(areaId, (nextSlots) => {
      if (!isMounted) {
        return;
      }

      setSlots(nextSlots);
      setError(null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [areaId]);

  return {
    slots,
    isLoading,
    error,
    isUpdatingSlot,
    toggleSlotStatus,
  };
};
