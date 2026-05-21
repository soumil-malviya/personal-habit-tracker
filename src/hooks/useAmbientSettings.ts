import { useAmbientSettingsContext } from '../contexts/AmbientSettingsContext';

/** Ambient settings — must be used inside AmbientSettingsProvider (AppLayout). */
export function useAmbientSettings() {
  return useAmbientSettingsContext();
}
