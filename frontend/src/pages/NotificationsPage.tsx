import { useState } from 'react'
import { useNotificationStore } from '../store/notificationStore'
import type { Notification } from '../store/notificationStore'
import {
  Bell, CheckCheck, Trash2, AlertTriangle, Info,
  CheckCircle, XCircle, Filter, Search
} from 'lucide-react'

const TYPE_CFG = {
  critical: { icon: XCircle,       color: '#FF453A', bg: 'rgba(255,69,58,0.07)',   border: 'rgba(255,69,58,0.20)',  label: 'Critical' },
  high:     { icon: AlertTriangle,  color: '#FF9F0A', bg: 'rgba(255,159,10,0.07)',  border: 'rgba(255,159,10,0.20)', label: 'High'     },
  info:     { icon: Info,           color: '#0A84FF', bg: 'rgba(10,132,255,0.07)',  border: 'rgba(10,132,255,0.20)', label: 'Info'     },
  success:  { icon: CheckCircle,    color: '#25A244', bg: 'rgba(48,209,88,0.07)',   border: 'rgba(48,209,88,0.20)',  label: 'Success'  },
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, clearAll, unreadCount } = useNotificationStore()
  const [filter,         setFilter]         = useState<'ALL' | 'critical' | 'high' | 'info' | 'success'>('ALL')
  const [search,         setSearch]         = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filtered = notifications.filter(n => {
    const mf = filter === 'ALL' || n.type === filter
    const ms = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase())
    const mu = !showUnreadOnly || !n.read
    return mf && ms && mu
  })

  return (
    <>
      <style>{`
        .notif-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        @media (max-width: 800px) { .notif-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 480px) { .notif-grid { grid-template-columns: 1fr 1fr; } }

        .notif-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 15px 20px; cursor: pointer; transition: background 0.15s ease;
        }
        .notif-row:hover { background: var(--surface) !important; }

        .type-filter-btn {
          padding: 5px 12px; border-radius: 20px; cursor: pointer;
          font-weight: 600; font-size: 0.75rem; transition: all 0.15s ease;
          border: 1px solid var(--border); background: var(--surface); color: var(--text-muted);
        }
        .type-filter-btn:hover { background: var(--surface-hover); color: var(--text-secondary); }
      `}</style>

      <div className="page-wrapper">

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, position: 'relative',
              background: 'rgba(10,132,255,0.10)', border: '1px solid rgba(10,132,255,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bell style={{ width: 18, height: 18, color: 'var(--blue)' }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
                  background: 'var(--red)', color: 'white',
                  fontSize: '0.6rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-primary)',
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Alerts & Notifications
              </h1>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                {unreadCount} unread · system risk events
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={markAllRead} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              <CheckCheck style={{ width: 14, height: 14 }} /> Mark All Read
            </button>
            <button onClick={clearAll} className="btn-danger" style={{ fontSize: '0.8rem' }}>
              <Trash2 style={{ width: 14, height: 14 }} /> Clear All
            </button>
          </div>
        </div>

        {/* ── SUMMARY CARDS ── */}
        <div className="notif-grid">
          {(Object.entries(TYPE_CFG) as [string, typeof TYPE_CFG[keyof typeof TYPE_CFG]][]).map(([type, cfg]) => {
            const count  = notifications.filter(n => n.type === type).length
            const unread = notifications.filter(n => n.type === type && !n.read).length
            const isActive = filter === type
            return (
              <div
                key={type}
                className="stat-card"
                style={{
                  cursor: 'pointer',
                  borderColor: isActive ? cfg.color + '35' : 'var(--border)',
                  background: isActive ? cfg.bg : 'rgba(255,255,255,0.85)',
                }}
                onClick={() => setFilter(isActive ? 'ALL' : type as any)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <cfg.icon style={{ width: 14, height: 14, color: cfg.color }} />
                  </div>
                  {unread > 0 && (
                    <span style={{
                      fontWeight: 700, fontSize: '0.65rem', color: cfg.color,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      padding: '2px 7px', borderRadius: 20,
                    }}>
                      {unread} new
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.6rem', color: cfg.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{count}</div>
                <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: 5 }}>{cfg.label}</div>
              </div>
            )
          })}
        </div>

        {/* ── FILTERS ── */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
            <input
              className="input" placeholder="Search notifications…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, fontSize: '0.84rem' }}
            />
          </div>

          {/* Type pill filters */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(['ALL', ...Object.keys(TYPE_CFG)] as const).map(t => {
              const cfg = t !== 'ALL' ? TYPE_CFG[t as keyof typeof TYPE_CFG] : null
              const isActive = filter === t
              return (
                <button
                  key={t}
                  className="type-filter-btn"
                  onClick={() => setFilter(t as any)}
                  style={isActive ? {
                    background: cfg ? cfg.bg : 'rgba(10,132,255,0.09)',
                    borderColor: cfg ? cfg.border : 'rgba(10,132,255,0.25)',
                    color: cfg ? cfg.color : 'var(--blue)',
                  } : {}}
                >
                  {t === 'ALL' ? 'All' : TYPE_CFG[t as keyof typeof TYPE_CFG].label}
                </button>
              )
            })}
          </div>

          {/* Unread toggle */}
          <button
            onClick={() => setShowUnreadOnly(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 13px', borderRadius: 20, cursor: 'pointer',
              fontWeight: 600, fontSize: '0.75rem',
              background: showUnreadOnly ? 'rgba(10,132,255,0.09)' : 'var(--surface)',
              border: `1px solid ${showUnreadOnly ? 'rgba(10,132,255,0.25)' : 'var(--border)'}`,
              color: showUnreadOnly ? 'var(--blue)' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            <Filter style={{ width: 12, height: 12 }} />
            Unread Only
          </button>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {filtered.length} of {notifications.length}
          </span>
        </div>

        {/* ── LIST ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: 12 }}>
              <Bell style={{ width: 40, height: 40, color: 'var(--text-ghost)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                No notifications
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {search || filter !== 'ALL' || showUnreadOnly ? 'Try adjusting your filters' : 'All clear — no events to show'}
              </span>
            </div>
          ) : (
            <div>
              {filtered.map((n: Notification, i: number) => {
                const cfg = TYPE_CFG[n.type as keyof typeof TYPE_CFG] ?? TYPE_CFG.info
                return (
                  <div
                    key={n.id}
                    className="notif-row"
                    onClick={() => markRead(n.id)}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      background: !n.read ? cfg.bg : 'transparent',
                      opacity: n.read ? 0.65 : 1,
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <cfg.icon style={{ width: 16, height: 16, color: cfg.color }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                        {n.message}
                      </p>
                    </div>

                    {/* Meta */}
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <span style={{
                        fontWeight: 600, fontSize: '0.68rem',
                        padding: '2px 9px', borderRadius: 20,
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        display: 'inline-block', marginBottom: 6,
                      }}>
                        {cfg.label}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {timeAgo(n.timestamp)}
                      </div>
                      {!n.read && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-ghost)', marginTop: 2 }}>
                          Click to mark read
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </>
  )
}