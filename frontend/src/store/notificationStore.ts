import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'critical' | 'high' | 'info' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  supplierId?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'critical', title: 'Critical Risk Detected', message: 'SCADA Experts SA scored 91.2 — immediate action required', timestamp: new Date(Date.now() - 1000 * 60 * 15), read: false },
  { id: '2', type: 'high', title: 'Assessment Overdue', message: 'TechServ Romania SRL re-evaluation is 30 days overdue', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false },
  { id: '3', type: 'info', title: 'New Supplier Added', message: 'EnergyTech Integrators has been registered in the system', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true },
  { id: '4', type: 'success', title: 'Assessment Completed', message: 'NetGuard Services assessment completed — LOW risk', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true },
  { id: '5', type: 'high', title: 'Contract Expiring', message: 'Siemens Energy Romania contract expires in 14 days', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), read: false },
]

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: DEMO_NOTIFICATIONS,
  unreadCount: DEMO_NOTIFICATIONS.filter(n => !n.read).length,
  addNotification: (n) => {
    const newN: Notification = { ...n, id: Date.now().toString(), timestamp: new Date(), read: false }
    set(state => ({
      notifications: [newN, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },
  markRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  markAllRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))