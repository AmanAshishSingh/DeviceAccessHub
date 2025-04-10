import { apiRequest } from "./queryClient";
import { create } from "zustand";

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  username: null,
  isLoading: false,
  error: null,
  
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest("POST", "/api/auth/login", { username, password });
      set({ isAuthenticated: true, username, isLoading: false });
    } catch (error) {
      set({
        isAuthenticated: false,
        username: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed"
      });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await apiRequest("POST", "/api/auth/logout");
      set({ isAuthenticated: false, username: null, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Logout failed"
      });
    }
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await apiRequest("GET", "/api/auth/user");
      const data = await response.json();
      set({ 
        isAuthenticated: true, 
        username: data.user.username, 
        isLoading: false 
      });
    } catch (error) {
      set({
        isAuthenticated: false,
        username: null,
        isLoading: false
      });
    }
  }
}));
