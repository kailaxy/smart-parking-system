import { useCallback, useEffect, useState } from 'react';
import { ParkingAreaModel } from '../services/firestoreContracts';
import { getParkingAreas, ParkingServiceError } from '../services/parkingService';

type UseParkingAreasState = {
  areas: ParkingAreaModel[];
  isLoading: boolean;
  error: ParkingServiceError | null;
  reload: () => Promise<void>;
};

export const useParkingAreas = (): UseParkingAreasState => {
  const [areas, setAreas] = useState<ParkingAreaModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ParkingServiceError | null>(null);

  const loadParkingAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getParkingAreas();

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
    void loadParkingAreas();
  }, [loadParkingAreas]);

  return {
    areas,
    isLoading,
    error,
    reload: loadParkingAreas,
  };
};
