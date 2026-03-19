import { useState } from 'react'
import { Search, Download, Filter, User, Shield, ClipboardList, AlertTriangle, Settings, Trash2, LogIn, ChevronDown } from 'lucide-react'

const ACTION_CFG = {
  LOGIN:      { icon: LogIn,        color: '#39e75f',  bg: 'rgba(57,231,95,0.1)',   label: 'LOGIN'      },
  ASSESSMENT: { icon: ClipboardList, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', label: 'ASSESSMENT' },
  SUPPLIER:   { icon: Shield,        color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'SUPPLIER'   },
  ALERT:      { icon: AlertTriangle, color: '#ffd60a', bg: 'rgba(255,214,10,0.1)',  label: 'ALERT'      },
  SETTINGS:   { icon: Settings,      color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: 'SETTINGS'   },
  DELETE:     { icon: Trash2,        color: '#ff2d55', bg: 'rgba(255,45,85,0.1)',   label: 'DELETE'     },
}

const DEMO_LOGS = [
  { id: '1',  action: 'LOGIN',      user: 'admin@supplyshield.ro',    detail: 'Successful authentication from IP 192.168.1.10',                        timestamp: new Date(Date.now() - 1000*60*5),   severity: 'info'     },
  { id: '2',  action: 'ASSESSMENT', user: 'admin@supplyshield.ro',    detail: 'Completed assessment for SCADA Experts SA — CRITICAL (91.2)',            timestamp: new Date(Date.now() - 1000*60*30),  severity: 'critical' },
  { id: '3',  action: 'SUPPLIER',   user: 'analyst@supplyshield.ro',  detail: 'Added new supplier: EnergyTech Integrators (HYBRID/CRITICAL)',           timestamp: new Date(Date.now() - 1000*60*60),  severity: 'info'     },
  { id: '4',  action: 'ALERT',      user: 'SYSTEM',                   detail: 'Auto-alert: TechServ Romania SRL re-evaluation overdue by 30 days',      timestamp: new Date(Date.now() - 1000*60*90),  severity: 'high'     },
  { id: '5',  action: 'ASSESSMENT', user: 'admin@supplyshield.ro',    detail: 'Started assessment for IndustrialOT Systems',                            timestamp: new Date(Date.now() - 1000*60*120), severity: 'info'     },
  { id: '6',  action: 'DELETE',     user: 'admin@supplyshield.ro',    detail: 'Deleted supplier record: Legacy Vendor GmbH',                            timestamp: new Date(Date.now() - 1000*60*180), severity: 'high'     },
  { id: '7',  action: 'SETTINGS',   user: 'admin@supplyshield.ro',    detail: 'Updated ERP integration settings — SAP connector enabled',               timestamp: new Date(Date.now() - 1000*60*240), severity: 'info'     },
  { id: '8',  action: 'LOGIN',      user: 'analyst@supplyshield.ro',  detail: 'Successful authentication from IP 10.0.0.5',                             timestamp: new Date(Date.now() - 1000*60*300), severity: 'info'     },
  { id: '9',  action: 'SUPPLIER',   user: 'analyst@supplyshield.ro',  detail: 'Updated risk profile: NetGuard Services — score recalculated to 31.5',   timestamp: new Date(Date.now() - 1000*60*360), severity: 'info'     },
  { id: '10', action: 'ALERT',      user: 'SYSTEM',                   detail: 'Critical threshold breach: SCADA Experts SA score exceeded 90',          timestamp: new Date(Date.now() - 1000*60*420), severity: 'critical' },
  { id: '11', action: 'ASSESSMENT', user: 'admin@supplyshield.ro',    detail: 'Completed assessment for TechServ Romania SRL — CRITICAL (82.5)',        timestamp: new Date(Date.now() - 1000*60*480), severity: 'critical' },
  { id: '12', action: 'SUPPLIER',   user: 'admin@supplyshield.ro',    detail: 'Modified access type for Siemens Energy Romania: REMOTE → PHYSICAL',     timestamp: new Date(Date.now() - 1000*60*540), severity: 'info'     },
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
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = DEMO_LOGS.filter(log => {
    const ms = !search || log.detail.toLowerCase().includes(search.toLowerCase()) || log.user.toLowerCase().includes(search.toLowerCase())
    const ma = actionFilter === 'ALL' || log.action === actionFilter
    const msv = severityFilter === 'ALL' || log.severity === severityFilter
    return ms && ma && msv
  })

  const exportCSV = () => {
    const csv = ['Timestamp,User,Action,Detail,Severity',
      ...filtered.map(l => `${new Date(l.timestamp).toISOString()},${l.user},${l.action},"${l.detail}",${l.severity}`)
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(57,231,95,0.15)', border: '1px solid rgba(57,231,95,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield style={{ width: 16, height: 16, color: '#39e75f' }} />
            </div>
            <div>
              <h1 className="page-title">Audit Log</h1>
              <div className="page-subtitle">// {DEMO_LOGS.length} events recorded — complete activity trail</div>
            </div>
          </div>
        </div>
        <button onClick={exportCSV} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          <Download style={{ width: 14, height: 14 }} /> Export CSV
        </button>
      </div>

      {/* Action type stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
        {Object.entries(ACTION_CFG).map(([key, cfg]) => {
          const count = DEMO_LOGS.filter(l => l.action === key).length
          const isActive = actionFilter === key
          return (
            <button key={key} onClick={() => setActionFilter(actionFilter === key ? 'ALL' : key)}
              className="stat-card"
              style={{ padding: '0.75rem', textAlign: 'center', cursor: 'pointer', borderColor: isActive ? cfg.color + '40' : 'rgba(255,255,255,0.08)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <cfg.icon style={{ width: 13, height: 13, color: cfg.color }} />
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', color: cfg.color }}>{count}</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.58rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginTop: '2px' }}>{cfg.label}</div>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search style={{ width: 13, height: 13, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
          <input className="input" placeholder="Search logs by user or action..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '0.82rem' }} />
        </div>

        {/* Severity filter */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['ALL', 'critical', 'high', 'info'].map(s => {
            const colors: Record<string, string> = { critical: '#ff2d55', high: '#ff6b35', info: '#22d3ee', ALL: '#39e75f' }
            const c = colors[s]
            return (
              <button key={s} onClick={() => setSeverityFilter(s)} style={{
                padding: '5px 10px', borderRadius: '7px', cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em',
                border: `1px solid ${severityFilter === s ? c + '50' : 'rgba(255,255,255,0.08)'}`,
                background: severityFilter === s ? `${c}15` : 'rgba(255,255,255,0.03)',
                color: severityFilter === s ? c : 'rgba(255,255,255,0.3)',
                transition: 'all 0.15s', textTransform: 'uppercase',
              }}>{s}</button>
            )
          })}
        </div>

        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
          {filtered.length} events
        </span>
      </div>

      {/* Log entries */}
      <div className="card" style={{ padding: 0 }}>
        {filtered.map((log, i) => {
          const cfg = ACTION_CFG[log.action as keyof typeof ACTION_CFG]
          const isExpanded = expanded === log.id
          const sevColor = log.severity === 'critical' ? '#ff2d55' : log.severity === 'high' ? '#ff6b35' : 'rgba(255,255,255,0.2)'

          return (
            <div key={log.id}
              style={{
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.15s',
              }}>
              <div
                onClick={() => setExpanded(isExpanded ? null : log.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '13px 18px', cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>

                {/* Action icon */}
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <cfg.icon style={{ width: 14, height: 14, color: cfg.color }} />
                </div>

                {/* User */}
                <div style={{ width: '180px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.user}
                    </span>
                  </div>
                </div>

                {/* Action badge */}
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', padding: '2px 8px', borderRadius: '4px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, flexShrink: 0 }}>
                  {cfg.label}
                </span>

                {/* Detail */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' }}>
                    {log.detail}
                  </p>
                </div>

                {/* Severity + time */}
                <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: sevColor, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', minWidth: '50px' }}>
                    {timeAgo(log.timestamp)}
                  </span>
                  <ChevronDown style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.15)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ padding: '0 18px 14px 64px' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { label: 'Timestamp', value: new Date(log.timestamp).toLocaleString('en-GB') },
                        { label: 'Action',    value: log.action },
                        { label: 'Severity',  value: log.severity.toUpperCase() },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: '3px' }}>{item.label}</div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: '3px' }}>Full Detail</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{log.detail}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}