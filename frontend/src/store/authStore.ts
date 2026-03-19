import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'analyst' | 'viewer'
  organization: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

// Demo users
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@supplyshield.ro': {
    password: 'admin123',
    user: { id: '1', name: 'Admin INFOSEC', email: 'admin@supplyshield.ro', role: 'admin', organization: 'INFOSEC CENTER' }
  },
  'analyst@supplyshield.ro': {
    password: 'analyst123',
    user: { id: '2', name: 'Analyst User', email: 'analyst@supplyshield.ro', role: 'analyst', organization: 'INFOSEC CENTER' }
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        await new Promise(r => setTimeout(r, 800))
        const match = DEMO_USERS[email]
        if (match && match.password === password) {
          set({ user: match.user, token: 'demo-token-' + Date.now(), isAuthenticated: true })
          return true
        }
        return false
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateProfile: (data) => set(state => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
    }),
    { name: 'supplyshield-auth' }
  )
)