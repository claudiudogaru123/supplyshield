import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dashboardApi, suppliersApi } from '../utils/api'
import { getScoreColor, getRiskBadgeClass, formatDate } from '../utils/helpers'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import {
  Shield, AlertTriangle, TrendingUp, CheckCircle,
  Users, Activity, ArrowRight, Clock, Zap,
  AlertOctagon, ChevronRight, BarChart3, Loader2
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid
} from 'recharts'
import type { Supplier } from '../types'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(8,18,32,0.97)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 14px',
      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
    }}>
      {label && <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || '#39e75f', fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { notifications } = useNotificationStore()

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000,
  })

  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersApi.getAll,
  })

  const isLoading = loadingStats || loadingSuppliers

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
      <Loader2 style={{ width: 28, height: 28, color: '#39e75f', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
        LOADING DASHBOARD...
      </span>
    </div>
  )

  // Computed
  const critical   = suppliers.filter((s: Supplier) => s.risk_category === 'CRITICAL')
  const high       = suppliers.filter((s: Supplier) => s.risk_category === 'HIGH')
  const unassessed = suppliers.filter((s: Supplier) => !s.assessment_count)
  const avgScore   = suppliers.length
    ? suppliers.reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) / suppliers.length
    : 0

  const riskDist = [
    { name: 'CRITICAL', value: critical.length,                                                          color: '#ff2d55' },
    { name: 'HIGH',     value: high.length,                                                              color: '#ff6b35' },
    { name: 'MEDIUM',   value: suppliers.filter((s: Supplier) => s.risk_category === 'MEDIUM').length,  color: '#ffd60a' },
    { name: 'LOW',      value: suppliers.filter((s: Supplier) => s.risk_category === 'LOW').length,     color: '#39e75f' },
  ].filter(d => d.value > 0)

  const typeDist = ['IT', 'OT', 'HYBRID'].map(t => ({
    name: t,
    value: suppliers.filter((s: Supplier) => s.supplier_type === t).length,
    color: t === 'IT' ? '#22d3ee' : t === 'OT' ? '#a78bfa' : '#39e75f',
  }))

  // Simulated trend data
  const trendData = [
    { month: 'Oct', avg: 52, critical: 3 },
    { month: 'Nov', avg: 58, critical: 4 },
    { month: 'Dec', avg: 55, critical: 3 },
    { month: 'Jan', avg: 61, critical: 4 },
    { month: 'Feb', avg: 64, critical: 5 },
    { month: 'Mar', avg: avgScore, critical: critical.length },
  ]

  const unreadAlerts = notifications.filter(n => !n.read && (n.type === 'critical' || n.type === 'high'))

  return (
    <div className="page-wrapper">

      {/* ── WELCOME HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            // WELCOME BACK
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>
            {user?.name || 'Admin'}
          </h1>
          <div className="page-subtitle">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Critical alert banner */}
        {(critical.length > 0 || unreadAlerts.length > 0) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.2)',
            cursor: 'pointer', maxWidth: '380px',
          }} onClick={() => navigate('/notifications')}>
            <AlertOctagon style={{ width: 18, height: 18, color: '#ff2d55', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#ff7a95' }}>
                {critical.length} CRITICAL SUPPLIERS REQUIRE ATTENTION
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,45,85,0.5)', marginTop: '2px' }}>
                {unreadAlerts.length} unread alerts · Click to view
              </div>
            </div>
            <ChevronRight style={{ width: 14, height: 14, color: '#ff2d55', flexShrink: 0 }} />
          </div>
        )}
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {[
          {
            label:  'Total Suppliers',
            value:  suppliers.length,
            sub:    `${typeDist.map(t => `${t.value} ${t.name}`).join(' · ')}`,
            color:  '#39e75f',
            icon:   Users,
            action: () => navigate('/suppliers'),
          },
          {
            label:  'Avg Risk Score',
            value:  avgScore.toFixed(1),
            sub:    `Portfolio average · ${avgScore >= 75 ? 'CRITICAL' : avgScore >= 50 ? 'HIGH' : avgScore >= 25 ? 'MEDIUM' : 'LOW'} level`,
            color:  getScoreColor(avgScore),
            icon:   Activity,
            action: () => navigate('/reports'),
          },
          {
            label:  'Critical & High',
            value:  critical.length + high.length,
            sub:    `${critical.length} critical · ${high.length} high risk`,
            color:  critical.length > 0 ? '#ff2d55' : '#ff6b35',
            icon:   AlertTriangle,
            action: () => navigate('/suppliers'),
          },
          {
            label:  'Assessments Done',
            value:  stats?.completed_assessments || 0,
            sub:    `${unassessed.length} suppliers unassessed`,
            color:  '#22d3ee',
            icon:   CheckCircle,
            action: () => navigate('/reports'),
          },
        ].map(item => (
          <div key={item.label} className="stat-card" style={{ cursor: 'pointer' }}
            onClick={item.action}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${item.color}15`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon style={{ width: 15, height: 15, color: item.color }} />
              </div>
              <ArrowRight style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '2rem', color: item.color, lineHeight: 1 }}>
              {item.value}
            </div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '12px' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Risk trend chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Risk Score Trend</div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getScoreColor(avgScore)} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={getScoreColor(avgScore)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avg" name="Avg Score" stroke={getScoreColor(avgScore)} strokeWidth={2} fill="url(#avgGrad)" dot={{ fill: getScoreColor(avgScore), r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top risk suppliers table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Highest Risk Suppliers</div>
              <button onClick={() => navigate('/suppliers')} className="btn-ghost" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                View All <ChevronRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[...suppliers]
                .sort((a: Supplier, b: Supplier) => (b.risk_score || 0) - (a.risk_score || 0))
                .slice(0, 6)
                .map((s: Supplier) => {
                  const sc = getScoreColor(s.risk_score || 0)
                  return (
                    <div key={s.id}
                      onClick={() => navigate(`/suppliers/${s.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', borderRadius: '9px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.04)'
                      }}>
                      {/* Color indicator */}
                      <div style={{ width: '3px', height: '32px', borderRadius: '2px', background: sc, flexShrink: 0 }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.name}
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', marginTop: '1px' }}>
                          {s.supplier_type} · {s.sector} · {s.country}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '64px' }}>
                          <div className="score-bar-track">
                            <div className="score-bar-fill" style={{ width: `${s.risk_score || 0}%`, background: sc }} />
                          </div>
                        </div>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: sc, minWidth: '32px' }}>
                          {(s.risk_score || 0).toFixed(1)}
                        </span>
                        <span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category}</span>
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/assessment/${s.id}`) }}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(57,231,95,0.2)', background: 'rgba(57,231,95,0.08)', color: '#39e75f', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                          ASSESS
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* RIGHT COL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Risk donut */}
          <div className="card">
            <div className="section-title">Risk Distribution</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={riskDist} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                    dataKey="value" paddingAngle={4} strokeWidth={0}>
                    {riskDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {riskDist.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', flex: 1, letterSpacing: '0.05em' }}>{d.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.8rem', color: d.color }}>{d.value}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', minWidth: '30px', textAlign: 'right' }}>
                    {suppliers.length ? ((d.value / suppliers.length) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Type bar chart */}
          <div className="card">
            <div className="section-title">By Type</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={typeDist} barSize={32}>
                <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.35)', fontFamily: 'Rajdhani, sans-serif', fontSize: 12, fontWeight: 700 }} />
                <YAxis stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                  {typeDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="section-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { icon: Users,      label: 'Add New Supplier',     sub: 'Register a supplier',     color: '#39e75f', action: () => navigate('/suppliers') },
                { icon: Zap,        label: 'Start Assessment',      sub: 'Evaluate a supplier',     color: '#22d3ee', action: () => navigate('/suppliers') },
                { icon: BarChart3,  label: 'View Reports',          sub: 'Analytics & compliance',  color: '#a78bfa', action: () => navigate('/reports')   },
                { icon: AlertTriangle, label: 'Check Alerts',       sub: `${unreadAlerts.length} unread`,  color: '#ffd60a', action: () => navigate('/notifications') },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '9px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${item.color}08`
                    ;(e.currentTarget as HTMLElement).style.borderColor = `${item.color}20`
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)'
                  }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${item.color}15`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon style={{ width: 13, height: 13, color: item.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>{item.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', marginTop: '1px' }}>{item.sub}</div>
                  </div>
                  <ChevronRight style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.15)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Recent alerts */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Recent Alerts</div>
              <button onClick={() => navigate('/notifications')} className="btn-ghost" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
                All <ChevronRight style={{ width: 11, height: 11 }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {notifications.slice(0, 4).map(n => {
                const colors = { critical: '#ff2d55', high: '#ff6b35', info: '#22d3ee', success: '#39e75f' }
                const color = colors[n.type] || '#39e75f'
                return (
                  <div key={n.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: n.read ? 'rgba(255,255,255,0.01)' : `${color}08`,
                    border: `1px solid ${n.read ? 'rgba(255,255,255,0.04)' : color + '20'}`,
                    opacity: n.read ? 0.6 : 1,
                  }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, marginTop: '5px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.title}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', color: 'rgba(255,255,255,0.2)', marginTop: '1px' }}>
                        {Math.floor((Date.now() - new Date(n.timestamp).getTime()) / 60000)}m ago
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── UNASSESSED SUPPLIERS ── */}
      {unassessed.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(255,214,10,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock style={{ width: 16, height: 16, color: '#ffd60a' }} />
              <div className="section-title" style={{ marginBottom: 0, color: '#ffd60a' }}>
                Suppliers Awaiting Assessment ({unassessed.length})
              </div>
            </div>
            <button onClick={() => navigate('/suppliers')} className="btn-ghost" style={{ fontSize: '0.72rem' }}>
              View All <ChevronRight style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
            {unassessed.slice(0, 6).map((s: Supplier) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '9px',
                background: 'rgba(255,214,10,0.04)', border: '1px solid rgba(255,214,10,0.1)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onClick={() => navigate(`/assessment/${s.id}`)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', color: 'rgba(255,255,255,0.2)' }}>{s.supplier_type} · {s.criticality}</div>
                </div>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '5px', background: 'rgba(255,214,10,0.12)', color: '#ffd60a', border: '1px solid rgba(255,214,10,0.2)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  ASSESS →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}