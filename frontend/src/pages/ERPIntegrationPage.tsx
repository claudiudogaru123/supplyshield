import { useState } from 'react'
import { Settings, CheckCircle, XCircle, RefreshCw, Zap, Database, Link, AlertTriangle, Activity, Clock } from 'lucide-react'

const ERP_SYSTEMS = [
  { id: 'sap',       name: 'SAP S/4HANA',           emoji: '⚙️', status: 'connected',    lastSync: '2 hours ago', suppliers: 8,  color: '#25A244', desc: 'Enterprise procurement and vendor management'      },
  { id: 'oracle',    name: 'Oracle ERP Cloud',       emoji: '🔶', status: 'disconnected', lastSync: 'Never',       suppliers: 0,  color: '#FF453A', desc: 'Oracle vendor lifecycle management'                },
  { id: 'microsoft', name: 'Microsoft Dynamics 365', emoji: '🟦', status: 'pending',      lastSync: '5 days ago',  suppliers: 3,  color: '#CC8800', desc: 'Dynamics supplier collaboration portal'            },
  { id: 'infor',     name: 'Infor CloudSuite',       emoji: '🟣', status: 'disconnected', lastSync: 'Never',       suppliers: 0,  color: '#BF5AF2', desc: 'Industrial ERP for OT/manufacturing suppliers'     },
]

const SYNC_LOGS = [
  { time: '10:15',     action: 'SAP sync completed — 8 suppliers updated',            status: 'success' },
  { time: '08:00',     action: 'Scheduled sync started for SAP S/4HANA',              status: 'info'    },
  { time: 'Yesterday', action: 'Dynamics 365 connection timeout — retry pending',     status: 'warning' },
  { time: '2d ago',    action: 'SAP sync completed — 2 new suppliers imported',       status: 'success' },
  { time: '3d ago',    action: 'Oracle connection attempt failed — auth error',       status: 'error'   },
]

const STATUS_CFG = {
  connected:    { color: '#25A244', bg: 'rgba(48,209,88,0.08)',   border: 'rgba(48,209,88,0.22)',  label: 'Connected',    icon: CheckCircle   },
  disconnected: { color: '#FF453A', bg: 'rgba(255,69,58,0.08)',   border: 'rgba(255,69,58,0.22)',  label: 'Disconnected', icon: XCircle       },
  pending:      { color: '#CC8800', bg: 'rgba(255,214,10,0.08)',  border: 'rgba(255,214,10,0.25)', label: 'Pending',      icon: AlertTriangle },
}

const LOG_CFG = {
  success: { color: '#25A244', icon: CheckCircle   },
  warning: { color: '#CC8800', icon: AlertTriangle },
  error:   { color: '#FF453A', icon: XCircle       },
  info:    { color: '#0A84FF', icon: Zap           },
}

export default function ERPIntegrationPage() {
  const [systems,      setSystems]      = useState(ERP_SYSTEMS)
  const [syncing,      setSyncing]      = useState<string | null>(null)
  const [activeSystem, setActiveSystem] = useState<string | null>(null)

  const handleSync = async (id: string) => {
    setSyncing(id)
    await new Promise(r => setTimeout(r, 2000))
    setSyncing(null)
    setSystems(s => s.map(sys => sys.id === id ? { ...sys, lastSync: 'Just now' } : sys))
  }

  const handleConnect = (id: string) => {
    setSystems(s => s.map(sys => sys.id === id ? { ...sys, status: 'pending' } : sys))
    setTimeout(() => {
      setSystems(s => s.map(sys => sys.id === id ? { ...sys, status: 'connected', lastSync: 'Just now' } : sys))
    }, 2000)
  }

  const connected   = systems.filter(s => s.status === 'connected').length
  const totalSynced = systems.reduce((a, s) => a + s.suppliers, 0)

  return (
    <>
      <style>{`
        .erp-grid  { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
        .erp-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        .erp-meta  { display: grid; grid-template-columns: 1fr 1fr;       gap: 8px;  }
        @media (max-width: 900px)  { .erp-grid  { grid-template-columns: 1fr; } }
        @media (max-width: 700px)  { .erp-stats { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <div className="page-wrapper">

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(10,132,255,0.10)', border: '1px solid rgba(10,132,255,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Database style={{ width: 18, height: 18, color: 'var(--blue)' }} />
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ERP Integration
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
              Connect SupplyShield with enterprise systems
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="erp-stats">
          {[
            { label: 'Connected',       value: connected,                                          color: '#25A244', bg: 'rgba(48,209,88,0.08)',   border: 'rgba(48,209,88,0.18)',   icon: CheckCircle },
            { label: 'Pending Setup',   value: systems.filter(s => s.status !== 'connected').length, color: '#CC8800', bg: 'rgba(255,214,10,0.08)', border: 'rgba(255,214,10,0.22)', icon: Clock       },
            { label: 'Suppliers Synced',value: totalSynced,                                        color: '#0A84FF', bg: 'rgba(10,132,255,0.08)',  border: 'rgba(10,132,255,0.18)', icon: Database    },
            { label: 'Last Sync',       value: '2h ago',                                           color: '#BF5AF2', bg: 'rgba(191,90,242,0.08)',  border: 'rgba(191,90,242,0.18)', icon: Activity    },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: item.bg, border: `1px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon style={{ width: 14, height: 14, color: item.color }} />
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.6rem', color: item.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{item.value}</div>
              <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: 5 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* ── ERP CARDS ── */}
        <div className="erp-grid">
          {systems.map(sys => {
            const stCfg    = STATUS_CFG[sys.status as keyof typeof STATUS_CFG]
            const isActive = activeSystem === sys.id
            return (
              <div key={sys.id} className="card" style={{
                borderColor: isActive ? sys.color + '30' : 'var(--border)',
                transition: 'all 0.2s ease',
              }}>

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                    }}>
                      {sys.emoji}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2, letterSpacing: '-0.01em' }}>
                        {sys.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sys.desc}</div>
                    </div>
                  </div>

                  {/* Status pill */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 20, flexShrink: 0,
                    background: stCfg.bg, border: `1px solid ${stCfg.border}`,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', background: stCfg.color,
                      animation: sys.status === 'connected' ? 'animate-pulse-dot 2s ease-in-out infinite' : 'none',
                    }} />
                    <span style={{ fontWeight: 700, fontSize: '0.68rem', color: stCfg.color }}>{stCfg.label}</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="erp-meta" style={{ marginBottom: '1rem' }}>
                  {[
                    { label: 'Last Sync',  value: sys.lastSync           },
                    { label: 'Suppliers',  value: String(sys.suppliers)  },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding: '8px 12px', borderRadius: 10,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                        {item.label}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {sys.status === 'connected' ? (
                    <button
                      onClick={() => handleSync(sys.id)} disabled={syncing === sys.id}
                      className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                    >
                      <RefreshCw style={{ width: 13, height: 13, animation: syncing === sys.id ? 'spin 0.85s linear infinite' : 'none' }} />
                      {syncing === sys.id ? 'Syncing…' : 'Sync Now'}
                    </button>
                  ) : sys.status === 'pending' ? (
                    <button disabled className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', opacity: 0.6 }}>
                      <RefreshCw style={{ width: 13, height: 13, animation: 'spin 0.85s linear infinite' }} />
                      Connecting…
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(sys.id)}
                      className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                    >
                      <Link style={{ width: 13, height: 13 }} /> Connect
                    </button>
                  )}
                  <button
                    onClick={() => setActiveSystem(isActive ? null : sys.id)}
                    className="btn-secondary" style={{ fontSize: '0.8rem' }}
                  >
                    <Settings style={{ width: 13, height: 13 }} /> Config
                  </button>
                </div>

                {/* Config panel */}
                {isActive && (
                  <div style={{ marginTop: 12, padding: '14px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                      Configuration
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <label className="label">API Endpoint</label>
                        <input className="input" defaultValue={`https://api.${sys.id}.example.com/v1`} style={{ fontSize: '0.82rem' }} />
                      </div>
                      <div>
                        <label className="label">API Key</label>
                        <input className="input" type="password" defaultValue="••••••••••••••••" style={{ fontSize: '0.82rem' }} />
                      </div>
                      <button className="btn-primary" style={{ fontSize: '0.78rem', alignSelf: 'flex-start' }}>
                        <CheckCircle style={{ width: 12, height: 12 }} /> Save Config
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── SYNC LOG ── */}
        <div className="card">
          <div className="section-title">Sync Activity Log</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {SYNC_LOGS.map((log, i) => {
              const cfg  = LOG_CFG[log.status as keyof typeof LOG_CFG]
              const Icon = cfg.icon
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `${cfg.color}12`, border: `1px solid ${cfg.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 13, height: 13, color: cfg.color }} />
                  </div>
                  <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{log.action}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>{log.time}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </>
  )
}