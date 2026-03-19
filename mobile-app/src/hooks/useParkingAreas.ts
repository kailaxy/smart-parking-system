import { useCallback, useEffect, useState } from 'react';

import { ParkingAreaModel } from '../services/firestoreContracts';
import { parkingService, ParkingServiceError } from '../services/parkingService';

type UseParkingAreasState = {
  areas: ParkingAreaModel[];
  isLoading: boolean;
  error: ParkingServiceError | null;
  reload: () => Promise<void>;
};

export const useParkingAreas = (): UseParkingAreasState => {
  const [areas, setAreas] = useState<ParkingAreaModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ParkingServiceError | null>(null);

  const loadParkingAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await parkingService.getParkingAreas();

    if (!result.ok) {
      setAreas([]);
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setAreas(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      setIsLoading(true);
      setError(null);

      const result = await parkingService.getParkingAreas();
      if (!isMounted) {
        return;
      }

      if (!result.ok) {
        setAreas([]);
        setError(result.error);
        setIsLoading(false);
        return;
      }

      setAreas(result.data);
      setIsLoading(false);
    };

    void loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    areas,
    isLoading,
    error,
    reload: loadParkingAreas,
  };
};
