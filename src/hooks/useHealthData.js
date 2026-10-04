/**
 * MedGuardian AI — Custom Hook: useHealthData
 * Alias hook exposing health data context
 */

import { useHealthData as useHealthDataContext } from '../context/HealthDataContext';

export const useHealthData = () => {
  return useHealthDataContext();
};
