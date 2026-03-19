import { useState } from 'react'
import { Settings, CheckCircle, XCircle, RefreshCw, Zap, Database, Link, AlertTriangle, Activity, Clock } from 'lucide-react'

const ERP_SYSTEMS = [
  { id: 'sap',       name: 'SAP S/4HANA',            emoji: '⚙️', status: 'connected',    lastSync: '2 hours ago', suppliers: 8,  color: '#39e75f', desc: 'Enterprise procurement and vendor management' },
  { id: 'oracle',    name: 'Oracle ERP Cloud',        emoji: '🔶', status: 'disconnected', lastSync: 'Never',       suppliers: 0,  color: '#ff6b35', desc: 'Oracle vendor lifecycle management' },
  { id: 'microsoft', name: 'Microsoft Dynamics 365',  emoji: '🟦', status: 'pending',      lastSync: '5 days ago',  suppliers: 3,  color: '#ffd60a', desc: 'Dynamics supplier collaboration portal' },
  { id: 'infor',     name: 'Infor CloudSuite',        emoji: '🟣', status: 'disconnected', lastSync: 'Never',       suppliers: 0,  color: '#a78bfa', desc: 'Industrial ERP for OT/manufacturing suppliers' },
]

const SYNC_LOGS = [
  { time: '10:15', action: 'SAP sync completed — 8 suppliers updated',              status: 'success' },
  { time: '08:00', action: 'Scheduled sync started for SAP S/4HANA',                status: 'info'    },
  { time: 'Yesterday', action: 'Dynamics 365 connection timeout — retry pending',   status: 'warning' },
  { time: '2d ago',    action: 'SAP sync completed — 2 new suppliers imported',     status: 'success' },
  { time: '3d ago',    action: 'Oracle connection attempt failed — auth error',     status: 'error'   },
]

const STATUS_CFG = {
  connected:    { color: '#39e75f', label: 'CONNECTED',    icon: CheckCircle  },
  disconnected: { color: '#ff2d55', label: 'DISCONNECTED', icon: XCircle      },
  pending:      { color: '#ffd60a', label: 'PENDING',      icon: AlertTriangle },
}

export default function ERPIntegrationPage() {
  const [systems, setSystems] = useState(ERP_SYSTEMS)
  const [syncing, setSyncing] = useState<string | null>(null)
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

  const connected = systems.filter(s => s.status === 'connected').length
  const totalSynced = systems.reduce((a, s) => a + s.suppliers, 0)

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(57,231,95,0.15)', border: '1px solid rgba(57,231,95,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database style={{ width: 16, height: 16, color: '#39e75f' }} />
            </div>
            <div>
              <h1 className="page-title">ERP Integration</h1>
              <div className="page-subtitle">// connect supplyshield with enterprise systems</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {[
          { label: 'Connected',     value: connected,                                     color: '#39e75f', icon: CheckCircle  },
          { label: 'Pending Setup', value: systems.filter(s => s.status !== 'connected').length, color: '#ffd60a', icon: Clock },
          { label: 'Suppliers Synced', value: totalSynced,                                color: '#22d3ee', icon: Database     },
          { label: 'Last Sync',     value: '2h ago',                                      color: '#a78bfa', icon: Activity     },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${item.color}15`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon style={{ width: 14, height: 14, color: item.color }} />
              </div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.6rem', color: item.color, lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* ERP Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {systems.map(sys => {
          const stCfg = STATUS_CFG[sys.status as keyof typeof STATUS_CFG]
          const isActive = activeSystem === sys.id
          return (
            <div key={sys.id} className="card"
              style={{ borderColor: isActive ? sys.color + '30' : 'rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>

              {/* Top */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {sys.emoji}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'white', marginBottom: '2px' }}>{sys.name}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{sys.desc}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: `${stCfg.color}12`, border: `1px solid ${stCfg.color}30`, flexShrink: 0 }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: stCfg.color, animation: sys.status === 'connected' ? 'pulse-dot 2s ease-in-out infinite' : 'none' }} />
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', color: stCfg.color }}>{stCfg.label}</span>
                </div>
              </div>

              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
                {[
                  { label: 'Last Sync',  value: sys.lastSync    },
                  { label: 'Suppliers',  value: sys.suppliers.toString() },
                ].map(item => (
                  <div key={item.label} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {sys.status === 'connected' ? (
                  <button onClick={() => handleSync(sys.id)} disabled={syncing === sys.id} className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }}>
                    <RefreshCw style={{ width: 13, height: 13, animation: syncing === sys.id ? 'spin 1s linear infinite' : 'none' }} />
                    {syncing === sys.id ? 'SYNCING...' : 'SYNC NOW'}
                  </button>
                ) : sys.status === 'pending' ? (
                  <button disabled className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', opacity: 0.6 }}>
                    <RefreshCw style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                    CONNECTING...
                  </button>
                ) : (
                  <button onClick={() => handleConnect(sys.id)} className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }}>
                    <Link style={{ width: 13, height: 13 }} /> CONNECT
                  </button>
                )}
                <button onClick={() => setActiveSystem(isActive ? null : sys.id)}
                  className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                  <Settings style={{ width: 13, height: 13 }} /> Config
                </button>
              </div>

              {/* Config panel */}
              {isActive && (
                <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Configuration
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label className="label">API Endpoint</label>
                      <input className="input" defaultValue={`https://api.${sys.id}.example.com/v1`} style={{ fontSize: '0.78rem' }} />
                    </div>
                    <div>
                      <label className="label">API Key</label>
                      <input className="input" type="password" defaultValue="••••••••••••••••" style={{ fontSize: '0.78rem' }} />
                    </div>
                    <button className="btn-primary" style={{ fontSize: '0.72rem', alignSelf: 'flex-start' }}>
                      <CheckCircle style={{ width: 12, height: 12 }} /> Save Config
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sync log */}
      <div className="card">
        <div className="section-title">Sync Activity Log</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SYNC_LOGS.map((log, i) => {
            const color = log.status === 'success' ? '#39e75f' : log.status === 'warning' ? '#ffd60a' : log.status === 'error' ? '#ff2d55' : '#22d3ee'
            const Icon = log.status === 'success' ? CheckCircle : log.status === 'warning' ? AlertTriangle : log.status === 'error' ? XCircle : Zap
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '9px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Icon style={{ width: 14, height: 14, color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{log.action}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{log.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}