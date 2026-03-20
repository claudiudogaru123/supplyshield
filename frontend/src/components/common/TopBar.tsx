import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { Bell, User, LogOut, Settings, ChevronRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard':      { title: 'Dashboard',         subtitle: 'Risk overview & KPIs' },
  '/suppliers':      { title: 'Suppliers',          subtitle: 'Supplier registry' },
  '/reports':        { title: 'Reports',            subtitle: 'Analytics & exports' },
  '/notifications':  { title: 'Alerts',             subtitle: 'Notifications center' },
  '/audit-log':      { title: 'Audit Log',          subtitle: 'Activity history' },
  '/profile':        { title: 'Profile',            subtitle: 'Settings & preferences' },
  '/erp-integration':{ title: 'ERP Integration',   subtitle: 'System connections' },
  '/kpi':            { title: 'KPI Tracking',       subtitle: 'Performance indicators' },
  '/onboarding':     { title: 'Onboarding',         subtitle: 'Supplier onboarding' },
}

export default function TopBar() {
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showUserMenu])

  const pageInfo = PAGE_TITLES[location.pathname] ?? (
    location.pathname.startsWith('/assessment') ? { title: 'Assessment',      subtitle: 'Security evaluation' } :
    location.pathname.startsWith('/suppliers/')  ? { title: 'Supplier Detail', subtitle: 'Supplier profile'    } :
    { title: 'SupplyShield', subtitle: '' }
  )

  const today = new Date().toLocaleDateString('ro-RO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem',
      minHeight: 52,
      flexShrink: 0,
      background: 'rgba(245,245,247,0.85)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      position: 'sticky', top: 0, zIndex: 20,
      gap: '1rem',
    }}>

      {/* ── Left: breadcrumb + title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-ghost)', whiteSpace: 'nowrap' }}>
          SupplyShield
        </span>
        <ChevronRight style={{ width: 12, height: 12, color: 'var(--text-ghost)', flexShrink: 0 }} />
        <span style={{
          fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
          letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {pageInfo.title}
        </span>
        {/* Date — hidden on small screens */}
        <span style={{
          fontSize: '0.72rem', color: 'var(--text-ghost)', fontWeight: 400,
          marginLeft: 4, whiteSpace: 'nowrap',
        }} className="hide-mobile">
          · {today}
        </span>
      </div>

      {/* ── Right: actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

        {/* Bell */}
        <button
          onClick={() => navigate('/notifications')}
          style={{
            position: 'relative', width: 34, height: 34, borderRadius: 10,
            background: 'transparent', border: '1px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s ease',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'var(--surface)'; el.style.borderColor = 'var(--border)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'transparent'; el.style.borderColor = 'transparent'
          }}
        >
          <Bell style={{ width: 16, height: 16 }} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 3, right: 3,
              minWidth: 14, height: 14, borderRadius: 7,
              background: 'var(--red)', color: 'white',
              fontSize: '0.55rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px',
              border: '1.5px solid var(--bg-primary)',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar + dropdown */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 5px',
              borderRadius: 20,
              background: showUserMenu ? 'var(--surface-hover)' : 'var(--surface)',
              border: `1px solid ${showUserMenu ? 'var(--border-hover)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            {/* Name — hidden on mobile */}
            <span style={{
              fontSize: '0.82rem', fontWeight: 600,
              color: 'var(--text-primary)', letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }} className="hide-mobile">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: 220, borderRadius: 14, overflow: 'hidden',
                background: 'rgba(255,255,255,0.97)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
              }}
            >
              {/* User info header */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-ghost)', marginTop: 2 }}>
                  {user?.email}
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px' }}>
                {[
                  { icon: User,     label: 'Profile & Settings', action: () => { navigate('/profile');         setShowUserMenu(false) } },
                  { icon: Settings, label: 'ERP Integration',    action: () => { navigate('/erp-integration'); setShowUserMenu(false) } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 8,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontSize: '0.84rem', fontWeight: 500,
                      color: 'var(--text-secondary)', textAlign: 'left',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <item.icon style={{ width: 15, height: 15, color: 'var(--text-muted)', flexShrink: 0 }} />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Logout */}
              <div style={{ padding: '0 6px 6px', borderTop: '1px solid var(--border)', paddingTop: 6 }}>
                <button
                  onClick={() => { logout(); setShowUserMenu(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: '0.84rem', fontWeight: 500,
                    color: 'var(--red)', textAlign: 'left',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,69,58,0.07)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}