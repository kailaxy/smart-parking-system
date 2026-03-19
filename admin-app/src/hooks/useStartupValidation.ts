import { useEffect, useState } from 'react';
import { validateDataConsistency } from '../services/parkingService';

type StartupValidationState = {
  isValidationComplete: boolean;
  isValid: boolean;
  error: string | null;
};

export const useStartupValidation = (): StartupValidationState => {
  const [state, setState] = useState<StartupValidationState>({
    isValidationComplete: false,
    isValid: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const runValidation = async () => {
      try {
        const result = await validateDataConsistency();

        if (!isMounted) return;

        if (!result.ok) {
          setState({
            isValidationComplete: true,
            isValid: false,
            error: `Database validation failed: ${result.error.message}`,
          });
          return;
        }

        if (result.slotCount === 0) {
          setState({
            isValidationComplete: true,
            isValid: false,
            error: 'No parking slots found in database. Please run seed-firestore script.',
          });
          return;
        }

        if (result.issues.length > 0) {
          // Log issues but don't fail - they might be acceptable
          console.warn('[Startup] Data consistency issues detected:', result.issues);
        }

        setState({
          isValidationComplete: true,
          isValid: true,
          error: null,
        });
      } catch (error) {
        if (!isMounted) return;

        const errorMessage = error instanceof Error ? error.message : 'Unknown error during startup validation';
        setState({
          isValidationComplete: true,
          isValid: false,
          error: errorMessage,
        });
      }
    };

    void runValidation();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};
