/**
 * MedGuardian AI — Custom Hook: useLanguage
 * Exposes multi-lingual translation state and t(key) function
 */

import { useHealthData } from '../context/HealthDataContext';

export const useLanguage = () => {
  const { language, setLanguage, t } = useHealthData();
  return {
    language,
    setLanguage,
    t
  };
};
