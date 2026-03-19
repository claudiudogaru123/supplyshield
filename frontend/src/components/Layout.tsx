import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Shield, LayoutDashboard, Users, FileBarChart, Bell, Activity, ClipboardList, Settings, LogOut, History } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import TopBar from './common/TopBar'
import { Target } from 'lucide-react'
const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/suppliers', icon: Users, label: 'Suppliers' },
  { to: '/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Alerts', badge: true },
  { to: '/audit-log', icon: History, label: 'Audit Log' },
  { to: '/erp-integration', icon: Settings, label: 'ERP Integration' },
  { to: '/kpi', icon: Target, label: 'KPI Tracking' },
  { to: '/onboarding', icon: ClipboardList, label: 'Onboarding' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#040d18' }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col flex-shrink-0"
        style={{
  background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
  borderRight: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}}>

        {/* Logo */}
        <div className="p-5" style={{ borderBottom: '1px solid rgba(57,231,95,0.08)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2abc4a, #39e75f)', boxShadow: '0 0 20px rgba(57,231,95,0.35)' }}>
              <Shield className="w-4 h-4 text-black" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{ background: '#39e75f', border: '2px solid #071020', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>
                <span style={{ color: 'white' }}>SUPPLY</span>
                <span style={{ color: '#39e75f' }}>SHIELD</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: '#1e3a5f', letterSpacing: '0.1em', marginTop: '2px' }}>
                CYBER RISK MGT
              </div>
            </div>
          </div>

          {/* System status */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
            style={{ background: 'rgba(57,231,95,0.05)', border: '1px solid rgba(57,231,95,0.12)' }}>
            <Activity className="w-3 h-3" style={{ color: '#39e75f' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.58rem', color: '#39e75f', letterSpacing: '0.08em' }}>SYSTEM ONLINE</span>
            <div className="ml-auto w-1.5 h-1.5 rounded-full"
              style={{ background: '#39e75f', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div style={{ fontFamily: 'Rajdhani', fontSize: '0.58rem', letterSpacing: '0.16em', color: '#1e3a5f', padding: '0.5rem 0.75rem 0.4rem', textTransform: 'uppercase' }}>
            Main Menu
          </div>
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div className="nav-item" style={isActive ? {
                  background: 'rgba(57,231,95,0.1)',
                  color: '#39e75f',
                  border: '1px solid rgba(57,231,95,0.2)',
                } : {}}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge && unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-black font-bold"
                      style={{ background: '#ff2d55', fontSize: '0.55rem', fontFamily: 'Rajdhani' }}>
                      {unreadCount}
                    </span>
                  )}
                  {isActive && (
                    <div className="w-1 h-4 rounded-full ml-auto"
                      style={{ background: 'linear-gradient(180deg, #39e75f, #2abc4a)' }} />
                  )}
                </div>
              )}
            </NavLink>
          ))}

          <div style={{ fontFamily: 'Rajdhani', fontSize: '0.58rem', letterSpacing: '0.16em', color: '#1e3a5f', padding: '0.75rem 0.75rem 0.4rem', textTransform: 'uppercase', marginTop: '0.5rem' }}>
            Account
          </div>
          <NavLink to="/profile" style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div className="nav-item" style={isActive ? { background: 'rgba(57,231,95,0.1)', color: '#39e75f', border: '1px solid rgba(57,231,95,0.2)' } : {}}>
                <ClipboardList className="w-4 h-4 flex-shrink-0" />
                <span>Profile</span>
              </div>
            )}
          </NavLink>
          <button onClick={() => { logout(); navigate('/login') }} className="nav-item w-full"
            style={{ color: '#334155' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ff6b8a'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,85,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#334155'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* User info */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(57,231,95,0.08)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2abc4a, #39e75f)' }}>
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.7rem', color: 'black' }}>
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: '#1e3a5f', textTransform: 'uppercase' }}>
                {user?.role || 'viewer'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}