import type { ThemeMode } from '../types';

export interface AppOutletContext {
  theme: ThemeMode;
  username: string;
  setUsername: (name: string) => void;
  maxStreak: number;
  toggleTheme: () => void;
}
