import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Users, FileBarChart, Bell,
  Activity, ClipboardList, LogOut, History, Target, Settings, Menu, X
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import TopBar from './common/TopBar'

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/suppliers',       icon: Users,           label: 'Suppliers' },
  { to: '/reports',         icon: FileBarChart,    label: 'Reports' },
  { to: '/notifications',   icon: Bell,            label: 'Alerts',          badge: true },
  { to: '/audit-log',       icon: History,         label: 'Audit Log' },
  { to: '/erp-integration', icon: Settings,        label: 'ERP Integration' },
  { to: '/kpi',             icon: Target,          label: 'KPI Tracking' },
  { to: '/onboarding',      icon: ClipboardList,   label: 'Onboarding' },
]

const baseNavStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.6rem',
  padding: '0.55rem 0.75rem', borderRadius: 10,
  transition: 'all 0.15s ease',
  fontWeight: 500, fontSize: '0.875rem', letterSpacing: '-0.01em',
  color: 'var(--text-muted)',
  background: 'transparent', border: '1px solid transparent',
  cursor: 'pointer', width: '100%', textAlign: 'left',
  textDecoration: 'none',
}

const activeNavStyle: React.CSSProperties = {
  fontWeight: 600,
  color: 'var(--blue)',
  background: 'rgba(10,132,255,0.09)',
  border: '1px solid rgba(10,132,255,0.16)',
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()

  return (
    <>
      {/* ── Logo ── */}
      <div style={{ padding: '1.25rem 1rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 2px 8px rgba(10,132,255,0.28)',
            position: 'relative',
          }}>
            <Shield style={{ width: 18, height: 18, color: 'white' }} />
            <div style={{
              position: 'absolute', top: -2, right: -2,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--green)', border: '2px solid var(--bg-primary)',
            }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.15 }}>
              SupplyShield
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-ghost)', fontWeight: 500, marginTop: 1 }}>
              Cyber Risk Management
            </div>
          </div>
        </div>

        {/* Status pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 20,
          background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.18)',
        }}>
          <div className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
          <Activity style={{ width: 11, height: 11, color: 'var(--green)' }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--green)', letterSpacing: '0.03em' }}>
            System Online
          </span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-ghost)', padding: '0 0.5rem 0.5rem' }}>
          Main Menu
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} onClick={onNavClick} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{ ...baseNavStyle, ...(isActive ? activeNavStyle : {}) }}>
                  <Icon style={{ width: 16, height: 16, flexShrink: 0, color: isActive ? 'var(--blue)' : 'var(--text-muted)' }} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && unreadCount > 0 && (
                    <span style={{
                      minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
                      background: 'var(--red)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700,
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        <div style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-ghost)', padding: '0 0.5rem 0.5rem', marginTop: '1.25rem' }}>
          Account
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <NavLink to="/profile" onClick={onNavClick} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{ ...baseNavStyle, ...(isActive ? activeNavStyle : {}) }}>
                <ClipboardList style={{ width: 16, height: 16, flexShrink: 0, color: isActive ? 'var(--blue)' : 'var(--text-muted)' }} />
                <span>Profile</span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => { logout(); navigate('/login') }}
            style={{ ...baseNavStyle }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'var(--red)'; el.style.background = 'rgba(255,69,58,0.07)'; el.style.borderColor = 'rgba(255,69,58,0.14)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'var(--text-muted)'; el.style.background = 'transparent'; el.style.borderColor = 'transparent'
            }}
          >
            <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* ── User footer ── */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 2px 6px rgba(10,132,255,0.25)',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-ghost)', textTransform: 'capitalize' }}>
              {user?.role || 'Viewer'}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Responsive styles injected once */}
      <style>{`
        .sidebar-desktop { display: flex !important; flex-direction: column; }
        .sidebar-mobile  { display: flex !important; flex-direction: column; }
        .mobile-topbar   { display: none !important; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-topbar   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar-mobile  { display: none !important; transform: none !important; }
        }
      `}</style>

      <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--bg-primary)' }}>

        {/* Desktop sidebar */}
        <aside className="sidebar-desktop" style={{
          width: 230, flexShrink: 0,
          background: 'rgba(255,255,255,0.76)',
          borderRight: '1px solid var(--border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}>
          <SidebarContent />
        </aside>

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div onClick={() => setMobileOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(3px)',
          }} />
        )}

        {/* Mobile slide-in sidebar */}
        <aside className="sidebar-mobile" style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, zIndex: 50,
          background: 'rgba(245,245,247,0.98)',
          borderRight: '1px solid var(--border)',
          backdropFilter: 'blur(24px)',
          boxShadow: mobileOpen ? 'var(--shadow-xl)' : 'none',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.32,0.72,0,1)',
        }}>
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Mobile top bar */}
          <div className="mobile-topbar" style={{
            alignItems: 'center', justifyContent: 'space-between',
            padding: '0.65rem 1rem',
            background: 'rgba(245,245,247,0.92)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            position: 'sticky', top: 0, zIndex: 30,
          }}>
            <button onClick={() => setMobileOpen(v => !v)} style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              {mobileOpen
                ? <X style={{ width: 18, height: 18, color: 'var(--text-primary)' }} />
                : <Menu style={{ width: 18, height: 18, color: 'var(--text-primary)' }} />
              }
            </button>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              SupplyShield
            </div>
            <div style={{ width: 36 }} />
          </div>

          <TopBar />

          <main style={{ flex: 1, overflowY: 'auto' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}