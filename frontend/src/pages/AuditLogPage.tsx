import { useState } from 'react'
import {
  Search, Download, User, Shield, ClipboardList, AlertTriangle,
  Settings, Trash2, LogIn, ChevronDown
} from 'lucide-react'

// ── Config ────────────────────────────────────────────────
const ACTION_CFG = {
  LOGIN:      { icon: LogIn,         color: '#25A244', bg: 'rgba(48,209,88,0.09)',   border: 'rgba(48,209,88,0.22)',   label: 'Login'      },
  ASSESSMENT: { icon: ClipboardList, color: '#0A84FF', bg: 'rgba(10,132,255,0.09)', border: 'rgba(10,132,255,0.22)', label: 'Assessment' },
  SUPPLIER:   { icon: Shield,        color: '#BF5AF2', bg: 'rgba(191,90,242,0.09)', border: 'rgba(191,90,242,0.22)', label: 'Supplier'   },
  ALERT:      { icon: AlertTriangle, color: '#CC8800', bg: 'rgba(255,214,10,0.09)', border: 'rgba(255,214,10,0.25)', label: 'Alert'      },
  SETTINGS:   { icon: Settings,      color: '#6E6E73', bg: 'rgba(110,110,115,0.09)',border: 'rgba(110,110,115,0.22)',label: 'Settings'   },
  DELETE:     { icon: Trash2,        color: '#FF453A', bg: 'rgba(255,69,58,0.09)',  border: 'rgba(255,69,58,0.22)',  label: 'Delete'     },
}

const SEV_COLOR: Record<string, string> = {
  critical: '#FF453A', high: '#FF9F0A', info: '#0A84FF',
}

const DEMO_LOGS = [
  { id: '1',  action: 'LOGIN',      user: 'admin@supplyshield.ro',   detail: 'Successful authentication from IP 192.168.1.10',                       timestamp: new Date(Date.now() - 1000*60*5),   severity: 'info'     },
  { id: '2',  action: 'ASSESSMENT', user: 'admin@supplyshield.ro',   detail: 'Completed assessment for SCADA Experts SA — CRITICAL (91.2)',           timestamp: new Date(Date.now() - 1000*60*30),  severity: 'critical' },
  { id: '3',  action: 'SUPPLIER',   user: 'analyst@supplyshield.ro', detail: 'Added new supplier: EnergyTech Integrators (HYBRID/CRITICAL)',          timestamp: new Date(Date.now() - 1000*60*60),  severity: 'info'     },
  { id: '4',  action: 'ALERT',      user: 'SYSTEM',                  detail: 'Auto-alert: TechServ Romania SRL re-evaluation overdue by 30 days',     timestamp: new Date(Date.now() - 1000*60*90),  severity: 'high'     },
  { id: '5',  action: 'ASSESSMENT', user: 'admin@supplyshield.ro',   detail: 'Started assessment for IndustrialOT Systems',                           timestamp: new Date(Date.now() - 1000*60*120), severity: 'info'     },
  { id: '6',  action: 'DELETE',     user: 'admin@supplyshield.ro',   detail: 'Deleted supplier record: Legacy Vendor GmbH',                           timestamp: new Date(Date.now() - 1000*60*180), severity: 'high'     },
  { id: '7',  action: 'SETTINGS',   user: 'admin@supplyshield.ro',   detail: 'Updated ERP integration settings — SAP connector enabled',              timestamp: new Date(Date.now() - 1000*60*240), severity: 'info'     },
  { id: '8',  action: 'LOGIN',      user: 'analyst@supplyshield.ro', detail: 'Successful authentication from IP 10.0.0.5',                            timestamp: new Date(Date.now() - 1000*60*300), severity: 'info'     },
  { id: '9',  action: 'SUPPLIER',   user: 'analyst@supplyshield.ro', detail: 'Updated risk profile: NetGuard Services — score recalculated to 31.5',  timestamp: new Date(Date.now() - 1000*60*360), severity: 'info'     },
  { id: '10', action: 'ALERT',      user: 'SYSTEM',                  detail: 'Critical threshold breach: SCADA Experts SA score exceeded 90',         timestamp: new Date(Date.now() - 1000*60*420), severity: 'critical' },
  { id: '11', action: 'ASSESSMENT', user: 'admin@supplyshield.ro',   detail: 'Completed assessment for TechServ Romania SRL — CRITICAL (82.5)',       timestamp: new Date(Date.now() - 1000*60*480), severity: 'critical' },
  { id: '12', action: 'SUPPLIER',   user: 'admin@supplyshield.ro',   detail: 'Modified access type for Siemens Energy Romania: REMOTE → PHYSICAL',    timestamp: new Date(Date.now() - 1000*60*540), severity: 'info'     },
]

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function AuditLogPage() {
  const [search,         setSearch]         = useState('')
  const [actionFilter,   setActionFilter]   = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [expanded,       setExpanded]       = useState<string | null>(null)

  const filtered = DEMO_LOGS.filter(log => {
    const ms  = !search || log.detail.toLowerCase().includes(search.toLowerCase()) || log.user.toLowerCase().includes(search.toLowerCase())
    const ma  = actionFilter   === 'ALL' || log.action   === actionFilter
    const msv = severityFilter === 'ALL' || log.severity === severityFilter
    return ms && ma && msv
  })

  const exportCSV = () => {
    const csv = [
      'Timestamp,User,Action,Detail,Severity',
      ...filtered.map(l => `${new Date(l.timestamp).toISOString()},${l.user},${l.action},"${l.detail}",${l.severity}`),
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <>
      <style>{`
        .audit-stats { display: grid; grid-template-columns: repeat(6,1fr); gap: 8px; }
        @media (max-width: 900px)  { .audit-stats { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 500px)  { .audit-stats { grid-template-columns: repeat(2,1fr); } }

        .sev-btn {
          padding: 5px 12px; border-radius: 20px; cursor: pointer;
          font-weight: 600; font-size: 0.72rem; transition: all 0.15s ease;
          border: 1px solid var(--border); background: var(--surface); color: var(--text-muted);
        }
        .sev-btn:hover { background: var(--surface-hover); color: var(--text-secondary); }

        .log-row { transition: background 0.12s ease; cursor: pointer; }
        .log-row:hover .log-row-inner { background: var(--surface); }
      `}</style>

      <div className="page-wrapper">

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(10,132,255,0.10)', border: '1px solid rgba(10,132,255,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield style={{ width: 18, height: 18, color: 'var(--blue)' }} />
            </div>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Audit Log
              </h1>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                {DEMO_LOGS.length} events recorded · complete activity trail
              </div>
            </div>
          </div>
          <button onClick={exportCSV} className="btn-primary" style={{ fontSize: '0.84rem' }}>
            <Download style={{ width: 14, height: 14 }} /> Export CSV
          </button>
        </div>

        {/* ── ACTION STATS ── */}
        <div className="audit-stats">
          {(Object.entries(ACTION_CFG) as [string, typeof ACTION_CFG[keyof typeof ACTION_CFG]][]).map(([key, cfg]) => {
            const count    = DEMO_LOGS.filter(l => l.action === key).length
            const isActive = actionFilter === key
            return (
              <button
                key={key}
                onClick={() => setActionFilter(actionFilter === key ? 'ALL' : key)}
                style={{
                  padding: '0.85rem 0.75rem', textAlign: 'center', cursor: 'pointer',
                  borderRadius: 14, transition: 'all 0.15s ease',
                  background: isActive ? cfg.bg : 'rgba(255,255,255,0.82)',
                  border: `1px solid ${isActive ? cfg.border : 'var(--border)'}`,
                  boxShadow: 'var(--shadow-sm)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 7px' }}>
                  <cfg.icon style={{ width: 13, height: 13, color: cfg.color }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', color: cfg.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{count}</div>
                <div style={{ fontWeight: 600, fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>{cfg.label}</div>
              </button>
            )
          })}
        </div>

        {/* ── FILTERS ── */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
            <input
              className="input" placeholder="Search logs by user or action…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, fontSize: '0.84rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 5 }}>
            {['ALL', 'critical', 'high', 'info'].map(s => {
              const c = s === 'ALL' ? 'var(--blue)' : SEV_COLOR[s]
              const isActive = severityFilter === s
              return (
                <button
                  key={s}
                  className="sev-btn"
                  onClick={() => setSeverityFilter(s)}
                  style={isActive ? {
                    background: `${c === 'var(--blue)' ? 'rgba(10,132,255' : c.replace(')', '')},0.09)`,
                    borderColor: `${c === 'var(--blue)' ? 'rgba(10,132,255' : c.replace(')', '')},0.25)`,
                    color: c,
                  } : {}}
                >
                  {s === 'ALL' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              )
            })}
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── LOG ENTRIES ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', gap: 12 }}>
              <Shield style={{ width: 40, height: 40, color: 'var(--text-ghost)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No log entries found</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Try adjusting your filters</span>
            </div>
          ) : filtered.map((log, i) => {
            const cfg        = ACTION_CFG[log.action as keyof typeof ACTION_CFG]
            const isExpanded = expanded === log.id
            const sevColor   = SEV_COLOR[log.severity] || 'var(--text-ghost)'

            return (
              <div
                key={log.id}
                className="log-row"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                {/* Main row */}
                <div
                  className="log-row-inner"
                  onClick={() => setExpanded(isExpanded ? null : log.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 18px', transition: 'background 0.12s ease',
                  }}
                >
                  {/* Icon */}
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <cfg.icon style={{ width: 14, height: 14, color: cfg.color }} />
                  </div>

                  {/* User */}
                  <div style={{ width: 190, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <User style={{ width: 10, height: 10, color: 'var(--text-ghost)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.user}
                      </span>
                    </div>
                  </div>

                  {/* Action badge */}
                  <span style={{
                    fontWeight: 600, fontSize: '0.68rem', padding: '2px 9px', borderRadius: 20,
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}>
                    {cfg.label}
                  </span>

                  {/* Detail */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: isExpanded ? 'normal' : 'nowrap',
                      lineHeight: 1.5,
                    }}>
                      {log.detail}
                    </p>
                  </div>

                  {/* Severity dot + time + chevron */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: sevColor, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, minWidth: 52 }}>
                      {timeAgo(log.timestamp)}
                    </span>
                    <ChevronDown style={{
                      width: 13, height: 13, color: 'var(--text-ghost)',
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }} />
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 14px 64px' }}>
                    <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 12 }}>
                        {[
                          { label: 'Timestamp', value: new Date(log.timestamp).toLocaleString('en-GB') },
                          { label: 'Action',    value: cfg.label },
                          { label: 'Severity',  value: log.severity.charAt(0).toUpperCase() + log.severity.slice(1) },
                        ].map(item => (
                          <div key={item.label}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                          Full Detail
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{log.detail}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </>
  )
}