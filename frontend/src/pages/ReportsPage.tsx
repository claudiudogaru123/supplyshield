import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { suppliersApi } from '../utils/api'
import type { Supplier } from '../types'
import { getRiskBadgeClass, getScoreColor } from '../utils/helpers'
import {
  Download, FileText, BarChart3, PieChart, TrendingUp,
  AlertTriangle, CheckCircle, Shield, Activity, Filter,
  Loader2, ChevronRight, Clock
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, LineChart, Line,
  CartesianGrid, Legend
} from 'recharts'

const COLORS = {
  CRITICAL: '#ff2d55',
  HIGH:     '#ff6b35',
  MEDIUM:   '#ffd60a',
  LOW:      '#39e75f',
  IT:       '#22d3ee',
  OT:       '#a78bfa',
  HYBRID:   '#39e75f',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(8,18,32,0.97)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 14px',
      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
    }}>
      {label && <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || '#39e75f', fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'compliance' | 'full'>('overview')

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersApi.getAll,
  })

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
      <Loader2 style={{ width: 24, height: 24, color: '#39e75f', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
        LOADING REPORT DATA...
      </span>
    </div>
  )

  // ── Computed data ──
  const assessed   = suppliers.filter((s: Supplier) => s.assessment_count > 0)
  const critical   = suppliers.filter((s: Supplier) => s.risk_category === 'CRITICAL')
  const high       = suppliers.filter((s: Supplier) => s.risk_category === 'HIGH')
  const medium     = suppliers.filter((s: Supplier) => s.risk_category === 'MEDIUM')
  const low        = suppliers.filter((s: Supplier) => s.risk_category === 'LOW')
  const avgScore   = suppliers.length ? suppliers.reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) / suppliers.length : 0
  const coverage   = suppliers.length ? (assessed.length / suppliers.length) * 100 : 0

  const riskDist = [
    { name: 'CRITICAL', value: critical.length, color: COLORS.CRITICAL },
    { name: 'HIGH',     value: high.length,     color: COLORS.HIGH     },
    { name: 'MEDIUM',   value: medium.length,   color: COLORS.MEDIUM   },
    { name: 'LOW',      value: low.length,      color: COLORS.LOW      },
  ].filter(d => d.value > 0)

  const typeDist = ['IT', 'OT', 'HYBRID'].map(t => ({
    name: t,
    count: suppliers.filter((s: Supplier) => s.supplier_type === t).length,
    avgScore: suppliers.filter((s: Supplier) => s.supplier_type === t).length
      ? suppliers.filter((s: Supplier) => s.supplier_type === t).reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) /
        suppliers.filter((s: Supplier) => s.supplier_type === t).length
      : 0,
    color: COLORS[t as keyof typeof COLORS],
  }))

  const sectorDist = [...new Set(suppliers.map((s: Supplier) => s.sector))]
    .map(sector => ({
      sector,
      count: suppliers.filter((s: Supplier) => s.sector === sector).length,
      avgScore: suppliers.filter((s: Supplier) => s.sector === sector).reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) /
        suppliers.filter((s: Supplier) => s.sector === sector).length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)

  const radarData = [
    { subject: 'IT Suppliers',  value: suppliers.filter((s: Supplier) => s.supplier_type === 'IT').length },
    { subject: 'OT Suppliers',  value: suppliers.filter((s: Supplier) => s.supplier_type === 'OT').length },
    { subject: 'Hybrid',        value: suppliers.filter((s: Supplier) => s.supplier_type === 'HYBRID').length },
    { subject: 'Assessed',      value: assessed.length },
    { subject: 'Critical Risk', value: critical.length },
    { subject: 'High Risk',     value: high.length },
  ]

  const scoreDistData = [
    { range: '0–25',  count: suppliers.filter((s: Supplier) => (s.risk_score || 0) <= 25).length,  color: COLORS.LOW      },
    { range: '26–50', count: suppliers.filter((s: Supplier) => (s.risk_score || 0) > 25 && (s.risk_score || 0) <= 50).length, color: COLORS.MEDIUM },
    { range: '51–75', count: suppliers.filter((s: Supplier) => (s.risk_score || 0) > 50 && (s.risk_score || 0) <= 75).length, color: COLORS.HIGH   },
    { range: '76+',   count: suppliers.filter((s: Supplier) => (s.risk_score || 0) > 75).length,   color: COLORS.CRITICAL },
  ]

  const exportCSV = () => {
    const headers = ['Name', 'Type', 'Country', 'Sector', 'Criticality', 'Access Type', 'Risk Score', 'Risk Category', 'Inherent Risk', 'Residual Risk', 'Assessments']
    const rows = suppliers.map((s: Supplier) => [
      `"${s.name}"`, s.supplier_type, s.country, `"${s.sector}"`,
      s.criticality, s.access_type,
      (s.risk_score || 0).toFixed(1), s.risk_category,
      (s.inherent_risk || 0).toFixed(1), (s.residual_risk || 0).toFixed(1),
      s.assessment_count
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `supplyshield-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const TABS = [
    { id: 'overview',    label: 'Overview',    icon: BarChart3  },
    { id: 'risk',        label: 'Risk Analysis', icon: Activity  },
    { id: 'compliance',  label: 'Compliance',  icon: FileText   },
    { id: 'full',        label: 'Full Report', icon: Shield     },
  ]

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(57,231,95,0.15)', border: '1px solid rgba(57,231,95,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 style={{ width: 16, height: 16, color: '#39e75f' }} />
            </div>
            <div>
              <h1 className="page-title">Reports & Analytics</h1>
              <div className="page-subtitle">// supply chain risk intelligence — {suppliers.length} suppliers</div>
            </div>
          </div>
        </div>
        <button onClick={exportCSV} className="btn-primary">
          <Download style={{ width: 14, height: 14 }} /> Export Full Report
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {[
          { label: 'Total Suppliers', value: suppliers.length, color: '#39e75f',  sub: 'registered',        icon: Shield    },
          { label: 'Avg Risk Score',  value: avgScore.toFixed(1), color: getScoreColor(avgScore), sub: 'portfolio avg', icon: Activity  },
          { label: 'Critical Risk',   value: critical.length,  color: '#ff2d55',  sub: 'need attention',    icon: AlertTriangle },
          { label: 'Assessed',        value: assessed.length,  color: '#22d3ee',  sub: `${coverage.toFixed(0)}% coverage`, icon: CheckCircle },
          { label: 'Assessment Cov.', value: `${coverage.toFixed(0)}%`, color: coverage >= 80 ? '#39e75f' : coverage >= 50 ? '#ffd60a' : '#ff2d55', sub: `${suppliers.length - assessed.length} pending`, icon: TrendingUp },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${item.color}15`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon style={{ width: 14, height: 14, color: item.color }} />
              </div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.6rem', color: item.color, lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{item.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px 8px 0 0',
            border: 'none', cursor: 'pointer',
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase',
            background: activeTab === tab.id ? 'rgba(57,231,95,0.1)' : 'transparent',
            color: activeTab === tab.id ? '#39e75f' : 'rgba(255,255,255,0.3)',
            borderBottom: activeTab === tab.id ? '2px solid #39e75f' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            <tab.icon style={{ width: 13, height: 13 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            {/* Risk distribution pie */}
            <div className="card">
              <div className="section-title">Risk Distribution</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ResponsiveContainer width={180} height={180}>
                  <RechartsPie>
                    <Pie data={riskDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                      dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {riskDist.map((entry, i) => (
                        <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {riskDist.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.82rem', color: d.color }}>{d.value}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', minWidth: '36px', textAlign: 'right' }}>
                        {suppliers.length ? ((d.value / suppliers.length) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Score distribution bar */}
            <div className="card">
              <div className="section-title">Score Distribution</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={scoreDistData} barSize={40}>
                  <XAxis dataKey="range" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
                  <YAxis stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {scoreDistData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Type breakdown */}
          <div className="card">
            <div className="section-title">Supplier Type Analysis</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {typeDist.map(t => (
                <div key={t.name} style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${t.color}20` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: t.color, letterSpacing: '0.08em' }}>{t.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.2rem', color: t.color }}>{t.count}</span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginBottom: '6px' }}>
                    Avg Risk Score
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem', color: getScoreColor(t.avgScore) }}>
                    {t.avgScore.toFixed(1)}
                  </div>
                  <div className="score-bar-track" style={{ marginTop: '6px' }}>
                    <div className="score-bar-fill" style={{ width: `${t.avgScore}%`, background: getScoreColor(t.avgScore) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio radar */}
          <div className="card">
            <div className="section-title">Portfolio Radar</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
                <Radar dataKey="value" stroke="#39e75f" fill="#39e75f" fillOpacity={0.12} strokeWidth={1.5} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── RISK ANALYSIS TAB ── */}
      {activeTab === 'risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Top risk suppliers */}
          <div className="card">
            <div className="section-title">Highest Risk Suppliers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[...suppliers].sort((a: Supplier, b: Supplier) => (b.risk_score || 0) - (a.risk_score || 0)).slice(0, 8).map((s: Supplier, i: number) => {
                const sc = getScoreColor(s.risk_score || 0)
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', width: '20px', flexShrink: 0 }}>
                      #{i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)' }}>{s.supplier_type} · {s.sector}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '80px' }}>
                        <div className="score-bar-track">
                          <div className="score-bar-fill" style={{ width: `${s.risk_score || 0}%`, background: sc }} />
                        </div>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: sc, minWidth: '36px' }}>
                        {(s.risk_score || 0).toFixed(1)}
                      </span>
                      <span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sector risk heatmap */}
          <div className="card">
            <div className="section-title">Risk by Sector</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sectorDist} layout="vertical" barSize={18}>
                <XAxis type="number" domain={[0, 100]} stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
                <YAxis dataKey="sector" type="category" width={120} stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="avgScore" radius={[0, 6, 6, 0]} name="Avg Score">
                  {sectorDist.map((entry, i) => (
                    <Cell key={i} fill={getScoreColor(entry.avgScore)} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Inherent vs Residual */}
          <div className="card">
            <div className="section-title">Inherent vs Residual Risk</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={suppliers.slice(0, 8).map((s: Supplier) => ({
                name: s.name.split(' ')[0],
                inherent: s.inherent_risk || 0,
                residual: s.residual_risk || 0,
              }))}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: 11 }} />
                <YAxis stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Legend wrapperStyle={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }} />
                <Bar dataKey="inherent" name="Inherent" fill="#ff6b35" fillOpacity={0.7} radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="residual" name="Residual" fill="#ffd60a" fillOpacity={0.7} radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── COMPLIANCE TAB ── */}
      {activeTab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Compliance summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              {
                title: 'NIS2 Readiness',
                score: Math.round(coverage * 0.7 + (assessed.length > 0 ? 30 : 0)),
                color: '#22d3ee',
                items: ['Critical supplier identification', 'Risk assessments', 'Incident reporting procedures', 'Supply chain security measures'],
                done: [true, assessed.length > 0, false, false],
              },
              {
                title: 'IEC 62443 Coverage',
                score: Math.round(suppliers.filter((s: Supplier) => s.supplier_type !== 'IT').length > 0 ? 45 : 10),
                color: '#a78bfa',
                items: ['OT supplier classification', 'Remote access controls', 'Network segmentation', 'Safety impact assessment'],
                done: [true, false, false, false],
              },
              {
                title: 'ISO 27001 Alignment',
                score: Math.round(coverage * 0.8),
                color: '#39e75f',
                items: ['Supplier relationships policy', 'Service delivery monitoring', 'Change management', 'Information security'],
                done: [assessed.length > 0, false, false, true],
              },
            ].map(fw => (
              <div key={fw.title} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: fw.color, letterSpacing: '0.05em' }}>{fw.title}</div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem', color: fw.color }}>{fw.score}%</span>
                </div>
                <div className="score-bar-track" style={{ marginBottom: '12px' }}>
                  <div className="score-bar-fill" style={{ width: `${fw.score}%`, background: fw.color }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {fw.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {fw.done[i]
                        ? <CheckCircle style={{ width: 12, height: 12, color: '#39e75f', flexShrink: 0 }} />
                        : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />}
                      <span style={{ fontSize: '0.75rem', color: fw.done[i] ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)', lineHeight: 1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Assessment coverage */}
          <div className="card">
            <div className="section-title">Assessment Coverage</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {suppliers.map((s: Supplier) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.assessment_count > 0 ? 'rgba(57,231,95,0.1)' : 'rgba(255,45,85,0.1)'}` }}>
                  {s.assessment_count > 0
                    ? <CheckCircle style={{ width: 13, height: 13, color: '#39e75f', flexShrink: 0 }} />
                    : <Clock style={{ width: 13, height: 13, color: '#ff2d55', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: s.assessment_count > 0 ? '#39e75f' : '#ff2d55', flexShrink: 0 }}>
                    {s.assessment_count > 0 ? `${s.assessment_count} done` : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FULL REPORT TAB ── */}
      {activeTab === 'full' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Complete Supplier Report</div>
              <button onClick={exportCSV} className="btn-secondary" style={{ fontSize: '0.72rem' }}>
                <Download style={{ width: 12, height: 12 }} /> Export CSV
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'Supplier', 'Type', 'Country', 'Sector', 'Criticality', 'Risk Score', 'Category', 'Inherent', 'Residual', 'Assessments'].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...suppliers].sort((a: Supplier, b: Supplier) => (b.risk_score || 0) - (a.risk_score || 0)).map((s: Supplier, i: number) => {
                    const sc = getScoreColor(s.risk_score || 0)
                    return (
                      <tr key={s.id} className="table-row">
                        <td className="table-cell" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem' }}>#{i + 1}</td>
                        <td className="table-cell">
                          <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>{s.name}</div>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)' }}>{s.contact_email || '—'}</div>
                        </td>
                        <td className="table-cell">
                          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.08em', padding: '2px 7px', borderRadius: '4px', background: `${COLORS[s.supplier_type as keyof typeof COLORS]}15`, color: COLORS[s.supplier_type as keyof typeof COLORS], border: `1px solid ${COLORS[s.supplier_type as keyof typeof COLORS]}30` }}>
                            {s.supplier_type}
                          </span>
                        </td>
                        <td className="table-cell">{s.country}</td>
                        <td className="table-cell">{s.sector}</td>
                        <td className="table-cell"><span className={getRiskBadgeClass(s.criticality)}>{s.criticality}</span></td>
                        <td className="table-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '48px' }}>
                              <div className="score-bar-track">
                                <div className="score-bar-fill" style={{ width: `${s.risk_score || 0}%`, background: sc }} />
                              </div>
                            </div>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.78rem', color: sc }}>{(s.risk_score || 0).toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="table-cell"><span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category || 'N/A'}</span></td>
                        <td className="table-cell" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#ff6b35' }}>{(s.inherent_risk || 0).toFixed(1)}</td>
                        <td className="table-cell" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#ffd60a' }}>{(s.residual_risk || 0).toFixed(1)}</td>
                        <td className="table-cell" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{s.assessment_count || 0}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}