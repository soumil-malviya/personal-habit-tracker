import { useLocalStorageString } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';

export function useOnboarding() {
  const [raw, setRaw] = useLocalStorageString(STORAGE_KEYS.onboardingComplete, '');
  const isComplete = raw === 'true';

  const completeOnboarding = () => setRaw('true');

  return { isComplete, completeOnboarding };
}
