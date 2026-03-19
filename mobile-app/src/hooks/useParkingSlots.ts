import { useCallback, useEffect, useState } from 'react';

import { ParkingSlotModel } from '../services/firestoreContracts';
import { parkingService, ParkingServiceError } from '../services/parkingService';

type UseParkingSlotsState = {
  slots: ParkingSlotModel[];
  isLoading: boolean;
  error: ParkingServiceError | null;
  reload: () => Promise<void>;
};

const toAreaScopedSlots = (allSlots: ParkingSlotModel[], areaId: string): ParkingSlotModel[] => {
  const normalizedAreaId = areaId.trim();
  return allSlots.filter((slot) => slot.areaId === normalizedAreaId);
};

export const useParkingSlots = (areaId: string | null | undefined): UseParkingSlotsState => {
  const [slots, setSlots] = useState<ParkingSlotModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ParkingServiceError | null>(null);

  const normalizedAreaId = areaId?.trim() ?? '';

  const loadSlotsByArea = useCallback(async () => {
    if (!normalizedAreaId) {
      setSlots([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await parkingService.getSlotsByArea(normalizedAreaId);

    if (!result.ok) {
      setSlots([]);
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setSlots(result.data);
    setIsLoading(false);
  }, [normalizedAreaId]);

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      if (!normalizedAreaId) {
        if (!isMounted) {
          return;
        }

        setSlots([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await parkingService.getSlotsByArea(normalizedAreaId);
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

    const unsubscribe = parkingService.listenToSlotUpdates((allSlots) => {
      if (!isMounted || !normalizedAreaId) {
        return;
      }

      const filteredSlots = toAreaScopedSlots(allSlots, normalizedAreaId);
      setSlots(filteredSlots);
      setError(null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [normalizedAreaId]);

  return {
    slots,
    isLoading,
    error,
    reload: loadSlotsByArea,
  };
};
