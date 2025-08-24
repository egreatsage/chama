import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Clear error
      clearError: () => set({ error: null }),

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });

          return { success: true, user: data.user };
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false,
            isAuthenticated: false,
            user: null 
          });
          return { success: false, error: error.message };
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }

          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });

          return { success: true, user: data.user };
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false,
            isAuthenticated: false,
            user: null 
          });
          return { success: false, error: error.message };
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        }
      },

      // Check auth status (for initial load)
      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          const response = await fetch('/api/auth/me', {
            credentials: 'include', // Ensure cookies are included
          });
          
          if (response.ok) {
            const data = await response.json();
            set({ 
              user: data.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
            return { success: true, user: data.user };
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
            return { success: false };
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null // Don't show error for auth check failures
          });
          return { success: false };
        }
      },

      // Update user profile
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
          
          // Update the user cookie as well
          document.cookie = `user=${JSON.stringify(updatedUser)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;