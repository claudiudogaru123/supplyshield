import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { Bell, User, LogOut, Settings } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Risk Dashboard',
  '/suppliers': 'Supplier Registry',
  '/reports': 'Reports & Analytics',
  '/notifications': 'Notifications',
  '/audit-log': 'Audit Log',
  '/profile': 'Profile & Settings',
  '/erp-integration': 'ERP Integration',
}

export default function TopBar() {
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const title = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/assessment') ? 'Security Assessment' :
     location.pathname.startsWith('/suppliers/') ? 'Supplier Detail' : 'SUPPLYSHIELD')

  return (
    <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(57,231,95,0.08)', background: 'rgba(4,13,24,0.95)', backdropFilter: 'blur(10px)', minHeight: '56px' }}>

      {/* Page title */}
      <div>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'white' }}>
          {title}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#1e3a5f', letterSpacing: '0.05em' }}>
          {new Date().toLocaleDateString('ro-RO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg transition-all"
          style={{ background: 'transparent', border: '1px solid transparent', cursor: 'pointer', color: '#475569' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(57,231,95,0.08)'; (e.currentTarget as HTMLElement).style.color = '#39e75f' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569' }}>
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-black font-bold"
              style={{ background: '#ff2d55', fontSize: '0.55rem', fontFamily: 'Rajdhani' }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => setShowUserMenu(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
            style={{ background: showUserMenu ? 'rgba(57,231,95,0.1)' : 'transparent', border: '1px solid', borderColor: showUserMenu ? 'rgba(57,231,95,0.2)' : 'transparent', cursor: 'pointer' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2abc4a, #39e75f)' }}>
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.65rem', color: 'black' }}>
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.75rem', color: '#e2e8f0', letterSpacing: '0.03em' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: '#334155', textTransform: 'uppercase' }}>
                {user?.role || 'viewer'}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden animate-slide-in z-50"
              style={{ background: '#071020', border: '1px solid rgba(57,231,95,0.15)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
              <div className="p-3" style={{ borderBottom: '1px solid rgba(57,231,95,0.08)' }}>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.8rem', color: '#e2e8f0' }}>{user?.name}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#334155', marginTop: '2px' }}>{user?.email}</div>
              </div>
              {[
                { icon: User, label: 'Profile & Settings', action: () => { navigate('/profile'); setShowUserMenu(false) } },
                { icon: Settings, label: 'ERP Integration', action: () => { navigate('/erp-integration'); setShowUserMenu(false) } },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontFamily: 'Rajdhani', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(57,231,95,0.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid rgba(57,231,95,0.08)' }}>
                <button onClick={() => { logout(); setShowUserMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff6b8a', fontFamily: 'Rajdhani', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,85,0.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}