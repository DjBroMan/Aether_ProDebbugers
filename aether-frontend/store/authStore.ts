import { create } from 'zustand';

export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authorityLevel?: number;
  avatar?: string;
  token: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  // Signals that a logout has occurred — watched by app/index.tsx
  // to know it should stay on the login screen (not redirect to tabs)
  loggedOut: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
  clearLoggedOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  loggedOut: false,
  setUser: (user) => set({ user, loggedOut: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    console.log('[STORE] logout() called — setting user: null, loggedOut: true');
    set({ user: null, loggedOut: true });
  },
  clearLoggedOut: () => set({ loggedOut: false }),
}));
