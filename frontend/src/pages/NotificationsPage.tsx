import { useState } from 'react'
import { useNotificationStore } from '../store/notificationStore'
import type { Notification } from '../store/notificationStore'
import {
  Bell, CheckCheck, Trash2, AlertTriangle, Info,
  CheckCircle, XCircle, Filter, Search
} from 'lucide-react'

const TYPE_CFG = {
  critical: { icon: XCircle,      color: '#ff2d55', bg: 'rgba(255,45,85,0.08)',   border: 'rgba(255,45,85,0.2)',   label: 'CRITICAL' },
  high:     { icon: AlertTriangle, color: '#ff6b35', bg: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.2)',  label: 'HIGH'     },
  info:     { icon: Info,          color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.2)',  label: 'INFO'     },
  success:  { icon: CheckCircle,   color: '#39e75f', bg: 'rgba(57,231,95,0.08)',  border: 'rgba(57,231,95,0.2)',   label: 'SUCCESS'  },
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
  const [filter, setFilter] = useState<'ALL' | 'critical' | 'high' | 'info' | 'success'>('ALL')
  const [search, setSearch] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filtered = notifications.filter(n => {
    const mf = filter === 'ALL' || n.type === filter
    const ms = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase())
    const mu = !showUnreadOnly || !n.read
    return mf && ms && mu
  })

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(57,231,95,0.15)', border: '1px solid rgba(57,231,95,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell style={{ width: 16, height: 16, color: '#39e75f' }} />
            </div>
            <div>
              <h1 className="page-title">Alerts & Notifications</h1>
              <div className="page-subtitle">// {unreadCount} unread — system risk events</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={markAllRead} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
            <CheckCheck style={{ width: 13, height: 13 }} /> Mark All Read
          </button>
          <button onClick={clearAll} className="btn-danger" style={{ fontSize: '0.75rem' }}>
            <Trash2 style={{ width: 13, height: 13 }} /> Clear All
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {Object.entries(TYPE_CFG).map(([type, cfg]) => {
          const count = notifications.filter(n => n.type === type).length
          const unread = notifications.filter(n => n.type === type && !n.read).length
          return (
            <div key={type} className="stat-card"
              style={{ cursor: 'pointer', borderColor: filter === type ? cfg.color + '40' : 'rgba(255,255,255,0.08)' }}
              onClick={() => setFilter(filter === type ? 'ALL' : type as any)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <cfg.icon style={{ width: 14, height: 14, color: cfg.color }} />
                </div>
                {unread > 0 && (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.6rem', color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 6px', borderRadius: '4px' }}>
                    {unread} new
                  </span>
                )}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.5rem', color: cfg.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginTop: '4px', textTransform: 'uppercase' }}>{cfg.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search style={{ width: 13, height: 13, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
          <input className="input" placeholder="Search notifications..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '0.82rem' }} />
        </div>
        <button onClick={() => setShowUnreadOnly(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: '9px', cursor: 'pointer',
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em',
          background: showUnreadOnly ? 'rgba(57,231,95,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${showUnreadOnly ? 'rgba(57,231,95,0.3)' : 'rgba(255,255,255,0.08)'}`,
          color: showUnreadOnly ? '#39e75f' : 'rgba(255,255,255,0.4)',
          transition: 'all 0.15s',
        }}>
          <Filter style={{ width: 12, height: 12 }} />
          Unread Only
        </button>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
          {filtered.length} of {notifications.length}
        </span>
      </div>

      {/* Notifications list */}
      <div className="card" style={{ padding: '0' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '12px' }}>
            <Bell style={{ width: 40, height: 40, color: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>
              NO NOTIFICATIONS
            </span>
          </div>
        ) : (
          <div>
            {filtered.map((n: Notification, i: number) => {
              const cfg = TYPE_CFG[n.type]
              return (
                <div key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '16px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: !n.read ? cfg.bg : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                    opacity: n.read ? 0.55 : 1,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = n.read ? 'rgba(255,255,255,0.02)' : cfg.bg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : cfg.bg}>

                  {/* Icon */}
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <cfg.icon style={{ width: 16, height: 16, color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                        {n.title}
                      </span>
                      {!n.read && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{n.message}</p>
                  </div>

                  {/* Meta */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', padding: '2px 8px', borderRadius: '4px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, marginBottom: '6px', display: 'inline-block' }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                      {timeAgo(n.timestamp)}
                    </div>
                    {!n.read && (
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', marginTop: '2px' }}>
                        click to mark read
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
  )
}