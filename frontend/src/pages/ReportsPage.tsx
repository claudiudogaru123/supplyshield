import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { suppliersApi } from '../utils/api'
import type { Supplier } from '../types'
import { getRiskBadgeClass } from '../utils/helpers'
import {
  Download, FileText, BarChart3, TrendingUp,
  AlertTriangle, CheckCircle, Shield, Activity,
  Loader2, Clock
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell,
  CartesianGrid, Legend
} from 'recharts'

// ── Helpers ───────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 75) return '#FF453A'
  if (s >= 50) return '#FF9F0A'
  if (s >= 25) return '#CC8800'
  return '#25A244'
}

const RISK_HEX: Record<string, string> = {
  CRITICAL: '#FF453A', HIGH: '#FF9F0A', MEDIUM: '#CC8800', LOW: '#25A244',
}
const TYPE_HEX: Record<string, string> = {
  IT: '#0A84FF', OT: '#BF5AF2', HYBRID: '#25A244',
}

// ── Light-mode tooltip ────────────────────────────────────
const LightTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.98)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '9px 13px', boxShadow: 'var(--shadow-md)',
      fontSize: '0.78rem',
    }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || 'var(--blue)', fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'compliance' | 'full'>('overview')

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'], queryFn: suppliersApi.getAll,
  })

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <Loader2 style={{ width: 24, height: 24, color: 'var(--blue)', animation: 'spin 0.85s linear infinite' }} />
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loading report data…</span>
    </div>
  )

  // ── Computed ──────────────────────────────────────────
  const assessed = suppliers.filter((s: Supplier) => s.assessment_count > 0)
  const critical = suppliers.filter((s: Supplier) => s.risk_category === 'CRITICAL')
  const high     = suppliers.filter((s: Supplier) => s.risk_category === 'HIGH')
  const medium   = suppliers.filter((s: Supplier) => s.risk_category === 'MEDIUM')
  const low      = suppliers.filter((s: Supplier) => s.risk_category === 'LOW')
  const avgScore = suppliers.length
    ? suppliers.reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) / suppliers.length : 0
  const coverage = suppliers.length ? (assessed.length / suppliers.length) * 100 : 0

  const riskDist = [
    { name: 'Critical', value: critical.length, color: '#FF453A' },
    { name: 'High',     value: high.length,     color: '#FF9F0A' },
    { name: 'Medium',   value: medium.length,   color: '#CC8800' },
    { name: 'Low',      value: low.length,      color: '#25A244' },
  ].filter(d => d.value > 0)

  const typeDist = ['IT', 'OT', 'HYBRID'].map(t => {
    const group = suppliers.filter((s: Supplier) => s.supplier_type === t)
    return {
      name: t, count: group.length, color: TYPE_HEX[t],
      avgScore: group.length ? group.reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) / group.length : 0,
    }
  })

  const sectorDist = [...new Set(suppliers.map((s: Supplier) => s.sector))]
    .map(sector => {
      const group = suppliers.filter((s: Supplier) => s.sector === sector)
      return {
        sector,
        count: group.length,
        avgScore: group.reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) / group.length,
      }
    })
    .sort((a, b) => b.avgScore - a.avgScore)

  const radarData = [
    { subject: 'IT',        value: suppliers.filter((s: Supplier) => s.supplier_type === 'IT').length },
    { subject: 'OT',        value: suppliers.filter((s: Supplier) => s.supplier_type === 'OT').length },
    { subject: 'Hybrid',    value: suppliers.filter((s: Supplier) => s.supplier_type === 'HYBRID').length },
    { subject: 'Assessed',  value: assessed.length },
    { subject: 'Critical',  value: critical.length },
    { subject: 'High Risk', value: high.length },
  ]

  const scoreDistData = [
    { range: '0–25',  count: suppliers.filter((s: Supplier) => (s.risk_score || 0) <= 25).length,                                                             color: '#25A244' },
    { range: '26–50', count: suppliers.filter((s: Supplier) => (s.risk_score || 0) > 25 && (s.risk_score || 0) <= 50).length,                                 color: '#CC8800' },
    { range: '51–75', count: suppliers.filter((s: Supplier) => (s.risk_score || 0) > 50 && (s.risk_score || 0) <= 75).length,                                 color: '#FF9F0A' },
    { range: '76+',   count: suppliers.filter((s: Supplier) => (s.risk_score || 0) > 75).length,                                                              color: '#FF453A' },
  ]

  const exportCSV = () => {
    const headers = ['Name','Type','Country','Sector','Criticality','Access Type','Risk Score','Risk Category','Inherent Risk','Residual Risk','Assessments']
    const rows = suppliers.map((s: Supplier) => [
      `"${s.name}"`, s.supplier_type, s.country, `"${s.sector}"`,
      s.criticality, s.access_type,
      (s.risk_score || 0).toFixed(1), s.risk_category,
      (s.inherent_risk || 0).toFixed(1), (s.residual_risk || 0).toFixed(1),
      s.assessment_count,
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `supplyshield-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const TABS = [
    { id: 'overview',   label: 'Overview',      icon: BarChart3  },
    { id: 'risk',       label: 'Risk Analysis',  icon: Activity   },
    { id: 'compliance', label: 'Compliance',     icon: FileText   },
    { id: 'full',       label: 'Full Report',    icon: Shield     },
  ]

  // shared axis tick style
  const axTick = { fill: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 11 }

  return (
    <>
      <style>{`
        .rep-kpi  { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; }
        .rep-grid { display: grid; grid-template-columns: 1fr 1fr;       gap: 12px; }
        .rep-fw   { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .rep-cov  { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px;  }
        @media (max-width: 1100px) { .rep-fw { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 900px)  { .rep-kpi { grid-template-columns: repeat(3,1fr); } .rep-grid { grid-template-columns: 1fr; } }
        @media (max-width: 600px)  { .rep-kpi { grid-template-columns: repeat(2,1fr); } .rep-fw { grid-template-columns: 1fr; } .rep-cov { grid-template-columns: 1fr; } }

        .tab-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border: none; cursor: pointer;
          font-weight: 600; font-size: 0.82rem; letter-spacing: -0.01em;
          background: transparent; color: var(--text-muted);
          border-bottom: 2px solid transparent;
          transition: all 0.15s ease;
        }
        .tab-btn:hover  { color: var(--text-secondary); }
        .tab-btn.active { color: var(--blue); border-bottom-color: var(--blue); background: rgba(10,132,255,0.06); border-radius: 8px 8px 0 0; }

        .risk-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 10px;
          background: var(--surface); border: 1px solid var(--border);
          transition: background 0.15s ease;
        }
        .risk-row:hover { background: var(--surface-hover); }
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
              <BarChart3 style={{ width: 18, height: 18, color: 'var(--blue)' }} />
            </div>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Reports & Analytics
              </h1>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                Supply chain risk intelligence · {suppliers.length} suppliers
              </div>
            </div>
          </div>
          <button onClick={exportCSV} className="btn-primary">
            <Download style={{ width: 14, height: 14 }} /> Export Full Report
          </button>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="rep-kpi">
          {[
            { label: 'Total Suppliers', value: suppliers.length,         color: '#0A84FF', bg: 'rgba(10,132,255,0.08)',  border: 'rgba(10,132,255,0.18)',  sub: 'registered',                  icon: Shield        },
            { label: 'Avg Risk Score',  value: avgScore.toFixed(1),      color: scoreColor(avgScore), bg: `${scoreColor(avgScore)}12`, border: `${scoreColor(avgScore)}22`, sub: 'portfolio avg', icon: Activity      },
            { label: 'Critical Risk',   value: critical.length,           color: '#FF453A', bg: 'rgba(255,69,58,0.07)',   border: 'rgba(255,69,58,0.18)',   sub: 'need attention',              icon: AlertTriangle },
            { label: 'Assessed',        value: assessed.length,           color: '#25A244', bg: 'rgba(48,209,88,0.08)',   border: 'rgba(48,209,88,0.18)',   sub: `${coverage.toFixed(0)}% coverage`, icon: CheckCircle },
            { label: 'Coverage',        value: `${coverage.toFixed(0)}%`, color: coverage >= 80 ? '#25A244' : coverage >= 50 ? '#CC8800' : '#FF453A', bg: 'rgba(10,132,255,0.07)', border: 'rgba(10,132,255,0.16)', sub: `${suppliers.length - assessed.length} pending`, icon: TrendingUp },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: item.bg, border: `1px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon style={{ width: 14, height: 14, color: item.color }} />
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.6rem', color: item.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{item.value}</div>
              <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: 5 }}>{item.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}>
              <tab.icon style={{ width: 13, height: 13 }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="rep-grid">

              {/* Risk pie */}
              <div className="card">
                <div className="section-title">Risk Distribution</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ResponsiveContainer width={170} height={170}>
                    <RechartsPie>
                      <Pie data={riskDist} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value" paddingAngle={3} strokeWidth={0}>
                        {riskDist.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.88} />)}
                      </Pie>
                      <Tooltip content={<LightTooltip />} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {riskDist.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                        <div style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 500, fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.84rem', color: d.color }}>{d.value}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
                          {suppliers.length ? ((d.value / suppliers.length) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score distribution */}
              <div className="card">
                <div className="section-title">Score Distribution</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={scoreDistData} barSize={40}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="range" stroke="transparent" tick={axTick} />
                    <YAxis stroke="transparent" tick={{ ...axTick, fontSize: 10 }} />
                    <Tooltip content={<LightTooltip />} cursor={{ fill: 'var(--surface)' }} />
                    <Bar dataKey="count" name="Suppliers" radius={[6,6,0,0]}>
                      {scoreDistData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Type breakdown */}
            <div className="card">
              <div className="section-title">Supplier Type Analysis</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {typeDist.map(t => (
                  <div key={t.name} style={{ padding: '1rem', borderRadius: 12, background: 'var(--surface)', border: `1px solid ${t.color}22` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: t.color }}>{t.name}</span>
                      <span style={{ fontWeight: 700, fontSize: '1.25rem', color: t.color, letterSpacing: '-0.02em' }}>{t.count}</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: 5 }}>Avg Risk Score</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: scoreColor(t.avgScore) }}>{t.avgScore.toFixed(1)}</div>
                    <div className="score-bar-track" style={{ marginTop: 6 }}>
                      <div className="score-bar-fill" style={{ width: `${t.avgScore}%`, background: scoreColor(t.avgScore) }} />
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
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 11 }} />
                  <Radar dataKey="value" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.10} strokeWidth={2} />
                  <Tooltip content={<LightTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── RISK ANALYSIS ── */}
        {activeTab === 'risk' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <div className="card">
              <div className="section-title">Highest Risk Suppliers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[...suppliers]
                  .sort((a: Supplier, b: Supplier) => (b.risk_score || 0) - (a.risk_score || 0))
                  .slice(0, 8)
                  .map((s: Supplier, i: number) => {
                    const sc = scoreColor(s.risk_score || 0)
                    return (
                      <div key={s.id} className="risk-row">
                        <span style={{ fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-ghost)', width: 22, flexShrink: 0 }}>
                          #{i + 1}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{s.supplier_type} · {s.sector}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 80 }}>
                            <div className="score-bar-track">
                              <div className="score-bar-fill" style={{ width: `${s.risk_score || 0}%`, background: sc }} />
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: sc, minWidth: 36 }}>
                            {(s.risk_score || 0).toFixed(1)}
                          </span>
                          <span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category}</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Sector risk */}
            <div className="card">
              <div className="section-title">Risk by Sector</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sectorDist} layout="vertical" barSize={18}>
                  <XAxis type="number" domain={[0, 100]} stroke="transparent" tick={{ ...axTick, fontSize: 10 }} />
                  <YAxis dataKey="sector" type="category" width={130} stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontFamily: 'inherit', fontSize: 11 }} />
                  <CartesianGrid stroke="var(--border)" horizontal={false} />
                  <Tooltip content={<LightTooltip />} cursor={{ fill: 'var(--surface)' }} />
                  <Bar dataKey="avgScore" name="Avg Score" radius={[0,6,6,0]}>
                    {sectorDist.map((entry, i) => <Cell key={i} fill={scoreColor(entry.avgScore)} fillOpacity={0.85} />)}
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
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="transparent" tick={axTick} />
                  <YAxis stroke="transparent" tick={{ ...axTick, fontSize: 10 }} />
                  <Tooltip content={<LightTooltip />} cursor={{ fill: 'var(--surface)' }} />
                  <Legend wrapperStyle={{ fontFamily: 'inherit', fontSize: '0.78rem', color: 'var(--text-muted)' }} />
                  <Bar dataKey="inherent" name="Inherent" fill="#FF9F0A" fillOpacity={0.75} radius={[4,4,0,0]} barSize={16} />
                  <Bar dataKey="residual" name="Residual" fill="#0A84FF" fillOpacity={0.75} radius={[4,4,0,0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── COMPLIANCE ── */}
        {activeTab === 'compliance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="rep-fw">
              {[
                {
                  title: 'NIS2 Readiness', color: '#0A84FF',
                  score: Math.round(coverage * 0.7 + (assessed.length > 0 ? 30 : 0)),
                  items: ['Critical supplier identification','Risk assessments','Incident reporting procedures','Supply chain security measures'],
                  done:  [true, assessed.length > 0, false, false],
                },
                {
                  title: 'IEC 62443 Coverage', color: '#BF5AF2',
                  score: Math.round(suppliers.filter((s: Supplier) => s.supplier_type !== 'IT').length > 0 ? 45 : 10),
                  items: ['OT supplier classification','Remote access controls','Network segmentation','Safety impact assessment'],
                  done:  [true, false, false, false],
                },
                {
                  title: 'ISO 27001 Alignment', color: '#25A244',
                  score: Math.round(coverage * 0.8),
                  items: ['Supplier relationships policy','Service delivery monitoring','Change management','Information security'],
                  done:  [assessed.length > 0, false, false, true],
                },
              ].map(fw => (
                <div key={fw.title} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: fw.color }}>{fw.title}</span>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: fw.color }}>{fw.score}%</span>
                  </div>
                  <div className="score-bar-track" style={{ marginBottom: 14 }}>
                    <div className="score-bar-fill" style={{ width: `${fw.score}%`, background: fw.color }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {fw.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        {fw.done[i]
                          ? <CheckCircle style={{ width: 13, height: 13, color: '#25A244', flexShrink: 0 }} />
                          : <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--border)', flexShrink: 0 }} />
                        }
                        <span style={{ fontSize: '0.78rem', color: fw.done[i] ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.4 }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Coverage grid */}
            <div className="card">
              <div className="section-title">Assessment Coverage</div>
              <div className="rep-cov">
                {suppliers.map((s: Supplier) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 9,
                    background: s.assessment_count > 0 ? 'rgba(48,209,88,0.06)' : 'rgba(255,69,58,0.06)',
                    border: `1px solid ${s.assessment_count > 0 ? 'rgba(48,209,88,0.18)' : 'rgba(255,69,58,0.18)'}`,
                  }}>
                    {s.assessment_count > 0
                      ? <CheckCircle style={{ width: 13, height: 13, color: '#25A244', flexShrink: 0 }} />
                      : <Clock       style={{ width: 13, height: 13, color: '#FF453A', flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0, fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: s.assessment_count > 0 ? '#25A244' : '#FF453A', flexShrink: 0 }}>
                      {s.assessment_count > 0 ? `${s.assessment_count} done` : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FULL REPORT ── */}
        {activeTab === 'full' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Complete Supplier Report</div>
              <button onClick={exportCSV} className="btn-secondary" style={{ fontSize: '0.78rem' }}>
                <Download style={{ width: 13, height: 13 }} /> Export CSV
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--surface)' }}>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#','Supplier','Type','Country','Sector','Criticality','Risk Score','Category','Inherent','Residual','Assessments'].map(h => (
                      <th key={h} className="table-header" style={{ padding: '11px 10px 11px 12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...suppliers]
                    .sort((a: Supplier, b: Supplier) => (b.risk_score || 0) - (a.risk_score || 0))
                    .map((s: Supplier, i: number) => {
                      const sc = scoreColor(s.risk_score || 0)
                      return (
                        <tr key={s.id} className="table-row">
                          <td className="table-cell" style={{ paddingLeft: 12, color: 'var(--text-ghost)', fontSize: '0.7rem' }}>#{i+1}</td>
                          <td className="table-cell" style={{ paddingLeft: 0 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>{s.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-ghost)', marginTop: 1 }}>{s.contact_email || '—'}</div>
                          </td>
                          <td className="table-cell">
                            <span style={{ fontWeight: 600, fontSize: '0.68rem', padding: '2px 8px', borderRadius: 6, background: `${TYPE_HEX[s.supplier_type]}12`, color: TYPE_HEX[s.supplier_type], border: `1px solid ${TYPE_HEX[s.supplier_type]}25` }}>
                              {s.supplier_type}
                            </span>
                          </td>
                          <td className="table-cell">{s.country}</td>
                          <td className="table-cell">{s.sector}</td>
                          <td className="table-cell"><span className={getRiskBadgeClass(s.criticality)}>{s.criticality}</span></td>
                          <td className="table-cell">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{ width: 46, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${s.risk_score || 0}%`, background: sc, borderRadius: 4 }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: sc }}>{(s.risk_score || 0).toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="table-cell"><span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category || 'N/A'}</span></td>
                          <td className="table-cell" style={{ fontWeight: 700, fontSize: '0.78rem', color: '#FF9F0A' }}>{(s.inherent_risk || 0).toFixed(1)}</td>
                          <td className="table-cell" style={{ fontWeight: 700, fontSize: '0.78rem', color: '#CC8800' }}>{(s.residual_risk || 0).toFixed(1)}</td>
                          <td className="table-cell" style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>{s.assessment_count || 0}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </>
  )
}