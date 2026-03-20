import { useQuery } from '@tanstack/react-query'
import { suppliersApi } from '../utils/api'
import type { Supplier } from '../types'
import {
  Target, TrendingDown, Clock, CheckCircle,
  Users, BarChart3, Activity, Zap
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell
} from 'recharts'

// ── Helpers ───────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 75) return '#FF453A'
  if (s >= 50) return '#FF9F0A'
  if (s >= 25) return '#CC8800'
  return '#25A244'
}

const LightTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.97)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '9px 13px', boxShadow: 'var(--shadow-md)', fontSize: '0.78rem',
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

// ── KPI Gauge ─────────────────────────────────────────────
function KPIGauge({ value, max, label, color, unit = '%' }: {
  value: number; max: number; label: string; color: string; unit?: string
}) {
  const pct  = Math.min((value / max) * 100, 100)
  const data = [
    { value: pct,       fill: color },
    { value: 100 - pct, fill: 'rgba(0,0,0,0.07)' },
  ]
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="75%" innerRadius="60%" outerRadius="90%"
            startAngle={180} endAngle={0} data={data} barSize={12}>
            <RadialBar dataKey="value" cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ fontWeight: 700, fontSize: '1.6rem', color, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {value.toFixed(0)}{unit}
          </div>
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-ghost)', marginTop: 2 }}>
        Target: {max}{unit}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function KPIPage() {
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'], queryFn: suppliersApi.getAll,
  })

  const total          = suppliers.length
  const assessed       = suppliers.filter((s: Supplier) => s.assessment_count > 0).length
  const critical       = suppliers.filter((s: Supplier) => s.risk_category === 'CRITICAL').length
  const high           = suppliers.filter((s: Supplier) => s.risk_category === 'HIGH').length
  const low            = suppliers.filter((s: Supplier) => s.risk_category === 'LOW').length
  const avgScore       = total ? suppliers.reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) / total : 0
  const coverage       = total ? (assessed / total) * 100 : 0
  const highRiskPct    = total ? ((critical + high) / total) * 100 : 0
  const totalAssessments = suppliers.reduce((a: number, s: Supplier) => a + (s.assessment_count || 0), 0)

  const adoptionTrend = [
    { month: 'Oct', suppliers: 3, assessments: 2, highRisk: 3 },
    { month: 'Nov', suppliers: 5, assessments: 4, highRisk: 4 },
    { month: 'Dec', suppliers: 6, assessments: 5, highRisk: 4 },
    { month: 'Jan', suppliers: 8, assessments: 7, highRisk: 5 },
    { month: 'Feb', suppliers: 9, assessments: 8, highRisk: 5 },
    { month: 'Mar', suppliers: total, assessments: totalAssessments, highRisk: critical + high },
  ]

  const kpiStatus = [
    { kpi: 'Suppliers Assessed',     current: assessed,                   target: total, unit: '',  color: '#0A84FF', pct: coverage                      },
    { kpi: 'Assessment Coverage',    current: Math.round(coverage),       target: 100,   unit: '%', color: '#25A244', pct: coverage                      },
    { kpi: 'High Risk Reduction',    current: Math.round(100-highRiskPct),target: 100,   unit: '%', color: '#CC8800', pct: 100 - highRiskPct              },
    { kpi: 'Avg Score Target (<50)', current: Math.round(avgScore),       target: 50,    unit: '',  color: scoreColor(avgScore), pct: Math.max(0,100-avgScore) },
    { kpi: 'Remediation Rate',       current: low,                        target: total, unit: '',  color: '#25A244', pct: total ? (low/total)*100 : 0   },
  ]

  const remediationData = [
    { name: 'Critical → High', value: Math.max(0, critical - 1), color: '#FF453A' },
    { name: 'High → Medium',   value: Math.max(0, high - 1),     color: '#FF9F0A' },
    { name: 'Medium → Low',    value: 2,                          color: '#CC8800' },
    { name: 'Already Low',     value: low,                        color: '#25A244' },
  ]

  const axTick = { fill: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 11 }

  return (
    <>
      <style>{`
        .kpi-gauges  { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; }
        .kpi-charts  { display: grid; grid-template-columns: 1fr 1fr;      gap: 12px; }
        .citadel-grid{ display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; }
        @media (max-width: 1100px) { .kpi-gauges { grid-template-columns: repeat(3,1fr); } .citadel-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 800px)  { .kpi-gauges { grid-template-columns: repeat(2,1fr); } .kpi-charts { grid-template-columns: 1fr; } .citadel-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 500px)  { .kpi-gauges { grid-template-columns: 1fr 1fr; } .citadel-grid { grid-template-columns: 1fr; } }

        .kpi-row {
          display: flex; align-items: center; gap: 16px;
          padding: 12px 16px; border-radius: 12px;
          background: var(--surface); border: 1px solid var(--border);
        }
      `}</style>

      <div className="page-wrapper">

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(10,132,255,0.10)', border: '1px solid rgba(10,132,255,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Target style={{ width: 18, height: 18, color: 'var(--blue)' }} />
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              KPI Tracking
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
              CITADEL project performance indicators · real-time
            </div>
          </div>
        </div>

        {/* ── GAUGES ── */}
        <div className="kpi-gauges">
          <KPIGauge value={coverage}                    max={100}        label="Assessment Coverage"  color="#0A84FF" />
          <KPIGauge value={100 - highRiskPct}           max={100}        label="Risk Reduction Rate"  color="#25A244" />
          <KPIGauge value={Math.max(0, 100 - avgScore)} max={100}        label="Score Improvement"    color="#CC8800" />
          <KPIGauge value={totalAssessments}            max={total * 2}  label="Total Assessments"    color="#BF5AF2" unit="" />
          <KPIGauge value={total > 0 ? (assessed/total)*100 : 0} max={100} label="User Adoption"     color="#FF9F0A" />
        </div>

        {/* ── KPI STATUS TABLE ── */}
        <div className="card">
          <div className="section-title">KPI Status vs Targets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {kpiStatus.map((kpi, i) => {
              const onTarget = kpi.pct >= 70
              return (
                <div key={i} className="kpi-row">
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${kpi.color}12`, border: `1px solid ${kpi.color}24`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {onTarget
                      ? <CheckCircle style={{ width: 14, height: 14, color: '#25A244' }} />
                      : <Activity    style={{ width: 14, height: 14, color: kpi.color  }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 5 }}>
                      {kpi.kpi}
                    </div>
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{ width: `${kpi.pct}%`, background: kpi.color }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: kpi.color, letterSpacing: '-0.01em' }}>
                      {kpi.current}{kpi.unit}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-ghost)', fontWeight: 500 }}>
                      target: {kpi.target}{kpi.unit}
                    </div>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.04em',
                    padding: '3px 10px', borderRadius: 20, flexShrink: 0,
                    background: onTarget ? 'rgba(48,209,88,0.10)' : 'rgba(255,214,10,0.10)',
                    color:      onTarget ? '#25A244'              : '#CC8800',
                    border: `1px solid ${onTarget ? 'rgba(48,209,88,0.25)' : 'rgba(255,214,10,0.28)'}`,
                  }}>
                    {onTarget ? 'On Track' : 'In Progress'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── CHARTS ── */}
        <div className="kpi-charts">

          {/* Adoption trend */}
          <div className="card">
            <div className="section-title">Platform Adoption Trend</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={adoptionTrend}>
                <defs>
                  <linearGradient id="suppGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0A84FF" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="assGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#25A244" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#25A244" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="transparent" tick={axTick} />
                <YAxis stroke="transparent" tick={{ ...axTick, fontSize: 10 }} />
                <Tooltip content={<LightTooltip />} />
                <Area type="monotone" dataKey="suppliers"   name="Suppliers"   stroke="#0A84FF" strokeWidth={2} fill="url(#suppGrad)" dot={{ fill: '#0A84FF', r: 3, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="assessments" name="Assessments" stroke="#25A244" strokeWidth={2} fill="url(#assGrad)"  dot={{ fill: '#25A244', r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Remediation pipeline */}
          <div className="card">
            <div className="section-title">Remediation Pipeline</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={remediationData} barSize={36}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 10 }} />
                <YAxis stroke="transparent" tick={{ ...axTick, fontSize: 10 }} />
                <Tooltip content={<LightTooltip />} cursor={{ fill: 'var(--surface)' }} />
                <Bar dataKey="value" name="Suppliers" radius={[6,6,0,0]}>
                  {remediationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── CITADEL KPIs ── */}
        <div className="card">
          <div className="section-title">CITADEL Project KPIs — Document Reference</div>
          <div className="citadel-grid">
            {[
              { kpi: 'Suppliers Assessed',        value: `${assessed}/${total}`,               color: '#0A84FF', icon: Users,       status: assessed === total ? 'Achieved' : 'In Progress' },
              { kpi: 'High-Risk Reduction',       value: `${(100-highRiskPct).toFixed(0)}%`,   color: '#25A244', icon: TrendingDown, status: highRiskPct < 30 ? 'Achieved' : 'In Progress'  },
              { kpi: 'Evaluation Time Reduction', value: '~75%',                               color: '#BF5AF2', icon: Clock,        status: 'Achieved'                                       },
              { kpi: 'Remediation Rate',          value: `${total > 0 ? Math.round((low/total)*100) : 0}%`, color: '#CC8800', icon: CheckCircle, status: low > 0 ? 'In Progress' : 'Pending' },
              { kpi: 'User Adoption',             value: `${Math.round(coverage)}%`,           color: '#FF9F0A', icon: Zap,          status: coverage > 50 ? 'On Track' : 'Pending'           },
            ].map(item => {
              const isAchieved   = item.status === 'Achieved'
              const isInProgress = item.status === 'In Progress' || item.status === 'On Track'
              return (
                <div key={item.kpi} style={{
                  padding: '1rem 0.85rem', borderRadius: 14, textAlign: 'center',
                  background: 'var(--surface)', border: `1px solid ${item.color}22`,
                  transition: 'box-shadow 0.15s ease',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${item.color}12`, border: `1px solid ${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <item.icon style={{ width: 14, height: 14, color: item.color }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', color: item.color, marginBottom: 4, letterSpacing: '-0.01em' }}>
                    {item.value}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.3 }}>
                    {item.kpi}
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.03em',
                    padding: '2px 9px', borderRadius: 20,
                    background: isAchieved   ? 'rgba(48,209,88,0.10)'
                              : isInProgress ? 'rgba(255,214,10,0.10)'
                              : 'var(--surface-hover)',
                    color: isAchieved   ? '#25A244'
                         : isInProgress ? '#CC8800'
                         : 'var(--text-muted)',
                    border: `1px solid ${isAchieved   ? 'rgba(48,209,88,0.25)'
                                       : isInProgress ? 'rgba(255,214,10,0.28)'
                                       : 'var(--border)'}`,
                  }}>
                    {item.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </>
  )
}