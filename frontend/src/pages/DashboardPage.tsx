import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dashboardApi, suppliersApi } from '../utils/api'
import { getScoreColor, getRiskBadgeClass, formatDate } from '../utils/helpers'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import {
  Shield, AlertTriangle, CheckCircle,
  Users, Activity, ArrowRight, Clock, Zap,
  AlertOctagon, ChevronRight, BarChart3, Loader2
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid
} from 'recharts'
import type { Supplier } from '../types'

// ── Light-mode chart tooltip ──────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.97)',
      border: '1px solid var(--border)',
      borderRadius: 10, padding: '9px 13px',
      boxShadow: 'var(--shadow-md)',
      fontSize: '0.78rem',
    }}>
      {label && (
        <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || 'var(--blue)', fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  )
}

// ── Score color override for light mode ───────────────────
function scoreColor(score: number) {
  if (score >= 75) return 'var(--red)'
  if (score >= 50) return 'var(--orange)'
  if (score >= 25) return 'var(--yellow)'
  return 'var(--green)'
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <Loader2 style={{ width: 28, height: 28, color: 'var(--blue)', animation: 'spin 0.85s linear infinite' }} />
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loading dashboard…</span>
    </div>
  )

  // ── Computed values ────────────────────────────────────
  const critical   = suppliers.filter((s: Supplier) => s.risk_category === 'CRITICAL')
  const high       = suppliers.filter((s: Supplier) => s.risk_category === 'HIGH')
  const unassessed = suppliers.filter((s: Supplier) => !s.assessment_count)
  const avgScore   = suppliers.length
    ? suppliers.reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) / suppliers.length
    : 0

  const riskDist = [
    { name: 'Critical', value: critical.length,                                                         color: 'var(--red)'    },
    { name: 'High',     value: high.length,                                                             color: 'var(--orange)' },
    { name: 'Medium',   value: suppliers.filter((s: Supplier) => s.risk_category === 'MEDIUM').length, color: 'var(--yellow)' },
    { name: 'Low',      value: suppliers.filter((s: Supplier) => s.risk_category === 'LOW').length,    color: 'var(--green)'  },
  ].filter(d => d.value > 0)

  const typeDist = ['IT', 'OT', 'HYBRID'].map(t => ({
    name:  t,
    value: suppliers.filter((s: Supplier) => s.supplier_type === t).length,
    color: t === 'IT' ? 'var(--blue)' : t === 'OT' ? 'var(--purple)' : 'var(--teal)',
  }))

  const typeDistHex = ['IT', 'OT', 'HYBRID'].map(t => ({
    name:  t,
    value: suppliers.filter((s: Supplier) => s.supplier_type === t).length,
    color: t === 'IT' ? '#0A84FF' : t === 'OT' ? '#BF5AF2' : '#5AC8FA',
  }))

  const trendData = [
    { month: 'Oct', avg: 52, critical: 3 },
    { month: 'Nov', avg: 58, critical: 4 },
    { month: 'Dec', avg: 55, critical: 3 },
    { month: 'Jan', avg: 61, critical: 4 },
    { month: 'Feb', avg: 64, critical: 5 },
    { month: 'Mar', avg: parseFloat(avgScore.toFixed(1)), critical: critical.length },
  ]

  const unreadAlerts = notifications.filter(n => !n.read && (n.type === 'critical' || n.type === 'high'))
  const sc = scoreColor(avgScore)

  return (
    <>
      <style>{`
        /* Responsive grid overrides */
        .kpi-grid    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .main-grid   { display: grid; grid-template-columns: 1fr 300px;     gap: 12px; }
        .unass-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 8px; }

        @media (max-width: 1100px) {
          .main-grid  { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .kpi-grid   { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .kpi-grid   { grid-template-columns: 1fr; }
        }

        /* Supplier row hover */
        .supplier-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          background: var(--surface); border: 1px solid var(--border);
          cursor: pointer; transition: all 0.15s ease;
        }
        .supplier-row:hover {
          background: var(--surface-hover);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-sm);
        }

        /* Quick action btn */
        .qa-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: var(--surface); border: 1px solid var(--border);
          cursor: pointer; text-align: left; width: 100%;
          transition: all 0.15s ease;
        }
        .qa-btn:hover {
          background: var(--surface-hover);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-sm);
        }
      `}</style>

      <div className="page-wrapper">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-ghost)', marginBottom: 4 }}>
              Welcome back
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {user?.name || 'Admin'}
            </h1>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Critical alert banner */}
          {(critical.length > 0 || unreadAlerts.length > 0) && (
            <div
              onClick={() => navigate('/notifications')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,69,58,0.07)', border: '1px solid rgba(255,69,58,0.20)',
                maxWidth: 380, transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,69,58,0.10)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,69,58,0.07)'}
            >
              <AlertOctagon style={{ width: 18, height: 18, color: 'var(--red)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--red)' }}>
                  {critical.length} critical supplier{critical.length !== 1 ? 's' : ''} need attention
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,69,58,0.65)', marginTop: 2 }}>
                  {unreadAlerts.length} unread alert{unreadAlerts.length !== 1 ? 's' : ''} · Click to view
                </div>
              </div>
              <ChevronRight style={{ width: 14, height: 14, color: 'var(--red)', flexShrink: 0 }} />
            </div>
          )}
        </div>

        {/* ── KPI CARDS ──────────────────────────────────────── */}
        <div className="kpi-grid">
          {[
            {
              label:  'Total Suppliers',
              value:  suppliers.length,
              sub:    typeDistHex.filter(t => t.value > 0).map(t => `${t.value} ${t.name}`).join(' · '),
              color:  '#0A84FF',
              bg:     'rgba(10,132,255,0.08)',
              border: 'rgba(10,132,255,0.18)',
              icon:   Users,
              action: () => navigate('/suppliers'),
            },
            {
              label:  'Avg Risk Score',
              value:  avgScore.toFixed(1),
              sub:    `Portfolio average · ${avgScore >= 75 ? 'Critical' : avgScore >= 50 ? 'High' : avgScore >= 25 ? 'Medium' : 'Low'} level`,
              color:  avgScore >= 75 ? '#FF453A' : avgScore >= 50 ? '#FF9F0A' : avgScore >= 25 ? '#CC8800' : '#25A244',
              bg:     avgScore >= 75 ? 'rgba(255,69,58,0.07)' : avgScore >= 50 ? 'rgba(255,159,10,0.08)' : 'rgba(48,209,88,0.08)',
              border: avgScore >= 75 ? 'rgba(255,69,58,0.18)' : avgScore >= 50 ? 'rgba(255,159,10,0.18)' : 'rgba(48,209,88,0.18)',
              icon:   Activity,
              action: () => navigate('/reports'),
            },
            {
              label:  'Critical & High',
              value:  critical.length + high.length,
              sub:    `${critical.length} critical · ${high.length} high risk`,
              color:  critical.length > 0 ? '#FF453A' : '#FF9F0A',
              bg:     critical.length > 0 ? 'rgba(255,69,58,0.07)' : 'rgba(255,159,10,0.08)',
              border: critical.length > 0 ? 'rgba(255,69,58,0.18)' : 'rgba(255,159,10,0.18)',
              icon:   AlertTriangle,
              action: () => navigate('/suppliers'),
            },
            {
              label:  'Assessments Done',
              value:  stats?.completed_assessments || 0,
              sub:    `${unassessed.length} supplier${unassessed.length !== 1 ? 's' : ''} unassessed`,
              color:  '#30D158',
              bg:     'rgba(48,209,88,0.08)',
              border: 'rgba(48,209,88,0.18)',
              icon:   CheckCircle,
              action: () => navigate('/reports'),
            },
          ].map(item => (
            <div
              key={item.label}
              className="stat-card"
              style={{ cursor: 'pointer' }}
              onClick={item.action}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: item.bg, border: `1px solid ${item.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <item.icon style={{ width: 16, height: 16, color: item.color }} />
                </div>
                <ArrowRight style={{ width: 13, height: 13, color: 'var(--text-ghost)' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '2rem', color: item.color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {item.value}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', marginTop: 5 }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ──────────────────────────────────────── */}
        <div className="main-grid">

          {/* LEFT ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Risk trend */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="section-title" style={{ marginBottom: 0 }}>Risk Score Trend</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-ghost)', fontWeight: 500 }}>Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0A84FF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="month" stroke="transparent"
                    tick={{ fill: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    domain={[0, 100]} stroke="transparent"
                    tick={{ fill: 'var(--text-ghost)', fontFamily: 'inherit', fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="avg" name="Avg Score"
                    stroke="#0A84FF" strokeWidth={2}
                    fill="url(#avgGrad)"
                    dot={{ fill: '#0A84FF', r: 3, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top risk suppliers */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="section-title" style={{ marginBottom: 0 }}>Highest Risk Suppliers</div>
                <button onClick={() => navigate('/suppliers')} className="btn-ghost" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                  View All <ChevronRight style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[...suppliers]
                  .sort((a: Supplier, b: Supplier) => (b.risk_score || 0) - (a.risk_score || 0))
                  .slice(0, 6)
                  .map((s: Supplier) => {
                    const sc = s.risk_score || 0
                    const color = sc >= 75 ? '#FF453A' : sc >= 50 ? '#FF9F0A' : sc >= 25 ? '#CC8800' : '#25A244'
                    return (
                      <div
                        key={s.id}
                        className="supplier-row"
                        onClick={() => navigate(`/suppliers/${s.id}`)}
                      >
                        <div style={{ width: 3, height: 32, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                            {s.supplier_type} · {s.sector} · {s.country}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 60 }}>
                            <div className="score-bar-track">
                              <div className="score-bar-fill" style={{ width: `${sc}%`, background: color }} />
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color, minWidth: 32, textAlign: 'right' }}>
                            {sc.toFixed(1)}
                          </span>
                          <span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category}</span>
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/assessment/${s.id}`) }}
                            style={{
                              padding: '4px 9px', borderRadius: 7,
                              border: '1px solid rgba(10,132,255,0.22)',
                              background: 'rgba(10,132,255,0.08)',
                              color: 'var(--blue)', cursor: 'pointer',
                              fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap',
                            }}>
                            Assess
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* RIGHT ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Risk donut */}
            <div className="card">
              <div className="section-title">Risk Distribution</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={riskDist} cx="50%" cy="50%"
                      innerRadius={42} outerRadius={68}
                      dataKey="value" paddingAngle={4} strokeWidth={0}
                    >
                      {riskDist.map((entry, i) => (
                        <Cell key={i} fill={
                          entry.name === 'Critical' ? '#FF453A' :
                          entry.name === 'High'     ? '#FF9F0A' :
                          entry.name === 'Medium'   ? '#FFD60A' : '#30D158'
                        } fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {riskDist.map((d, i) => {
                  const hex = i === 0 ? '#FF453A' : i === 1 ? '#FF9F0A' : i === 2 ? '#CC8800' : '#25A244'
                  return (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: hex, flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: hex }}>{d.value}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
                        {suppliers.length ? ((d.value / suppliers.length) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Type bar chart */}
            <div className="card">
              <div className="section-title">Suppliers by Type</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={typeDistHex} barSize={32}>
                  <XAxis
                    dataKey="name" stroke="transparent"
                    tick={{ fill: 'var(--text-secondary)', fontFamily: 'inherit', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    stroke="transparent"
                    tick={{ fill: 'var(--text-ghost)', fontFamily: 'inherit', fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface)' }} />
                  <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                    {typeDistHex.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick actions */}
            <div className="card">
              <div className="section-title">Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { icon: Users,         label: 'Add New Supplier',  sub: 'Register a supplier',    color: '#0A84FF', action: () => navigate('/suppliers')     },
                  { icon: Zap,           label: 'Start Assessment',  sub: 'Evaluate a supplier',    color: '#30D158', action: () => navigate('/suppliers')     },
                  { icon: BarChart3,     label: 'View Reports',      sub: 'Analytics & compliance', color: '#BF5AF2', action: () => navigate('/reports')       },
                  { icon: AlertTriangle, label: 'Check Alerts',      sub: `${unreadAlerts.length} unread`, color: '#FF9F0A', action: () => navigate('/notifications') },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className="qa-btn">
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: `${item.color}14`, border: `1px solid ${item.color}28`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <item.icon style={{ width: 13, height: 13, color: item.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{item.sub}</div>
                    </div>
                    <ChevronRight style={{ width: 13, height: 13, color: 'var(--text-ghost)', flexShrink: 0 }} />
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {notifications.slice(0, 4).map(n => {
                  const colors: Record<string, string> = {
                    critical: '#FF453A', high: '#FF9F0A',
                    info: '#0A84FF',    success: '#30D158',
                  }
                  const color = colors[n.type] || '#0A84FF'
                  return (
                    <div key={n.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      padding: '8px 10px', borderRadius: 9,
                      background: n.read ? 'var(--surface)' : `${color}0D`,
                      border: `1px solid ${n.read ? 'var(--border)' : color + '28'}`,
                      opacity: n.read ? 0.65 : 1,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-ghost)', marginTop: 1 }}>
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

        {/* ── UNASSESSED SUPPLIERS ───────────────────────────── */}
        {unassessed.length > 0 && (
          <div className="card" style={{ borderColor: 'rgba(255,159,10,0.22)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,159,10,0.10)', border: '1px solid rgba(255,159,10,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock style={{ width: 15, height: 15, color: 'var(--orange)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    Suppliers Awaiting Assessment
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                    {unassessed.length} supplier{unassessed.length !== 1 ? 's' : ''} have not been assessed yet
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/suppliers')} className="btn-ghost" style={{ fontSize: '0.75rem' }}>
                View All <ChevronRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
            <div className="unass-grid">
              {unassessed.slice(0, 6).map((s: Supplier) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/assessment/${s.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(255,159,10,0.05)', border: '1px solid rgba(255,159,10,0.14)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'rgba(255,159,10,0.09)'
                    el.style.borderColor = 'rgba(255,159,10,0.25)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'rgba(255,159,10,0.05)'
                    el.style.borderColor = 'rgba(255,159,10,0.14)'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                      {s.supplier_type} · {s.criticality}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 7,
                    background: 'rgba(255,159,10,0.10)', color: 'var(--orange)',
                    border: '1px solid rgba(255,159,10,0.22)', flexShrink: 0, whiteSpace: 'nowrap',
                  }}>
                    Assess →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}