import { useQuery } from '@tanstack/react-query'
import { suppliersApi } from '../utils/api'
import type { Supplier } from '../types'
import { getScoreColor } from '../utils/helpers'
import {
  Target, TrendingDown, Clock, CheckCircle,
  Users, BarChart3, Activity, Zap
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell
} from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(8,18,32,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem' }}>
      {label && <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || '#39e75f', fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  )
}

function KPIGauge({ value, max, label, color, unit = '%' }: {
  value: number; max: number; label: string; color: string; unit?: string
}) {
  const pct = Math.min((value / max) * 100, 100)
  const data = [{ value: pct, fill: color }, { value: 100 - pct, fill: 'rgba(255,255,255,0.05)' }]

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', height: '140px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="75%" innerRadius="60%" outerRadius="90%"
            startAngle={180} endAngle={0} data={data} barSize={12}>
            <RadialBar dataKey="value" cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.6rem', color, lineHeight: 1 }}>
            {value.toFixed(0)}{unit}
          </div>
        </div>
      </div>
      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(220,235,255,0.6)', marginTop: '4px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(180,210,255,0.42)', marginTop: '2px' }}>
        Target: {max}{unit}
      </div>
    </div>
  )
}

export default function KPIPage() {
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersApi.getAll,
  })

  const total       = suppliers.length
  const assessed    = suppliers.filter((s: Supplier) => s.assessment_count > 0).length
  const critical    = suppliers.filter((s: Supplier) => s.risk_category === 'CRITICAL').length
  const high        = suppliers.filter((s: Supplier) => s.risk_category === 'HIGH').length
  const low         = suppliers.filter((s: Supplier) => s.risk_category === 'LOW').length
  const avgScore    = total ? suppliers.reduce((a: number, s: Supplier) => a + (s.risk_score || 0), 0) / total : 0
  const coverage    = total ? (assessed / total) * 100 : 0
  const highRiskPct = total ? ((critical + high) / total) * 100 : 0
  const totalAssessments = suppliers.reduce((a: number, s: Supplier) => a + (s.assessment_count || 0), 0)

  // Simulated trend — in produzione verrebbe dal backend
  const adoptionTrend = [
    { month: 'Oct', suppliers: 3, assessments: 2, highRisk: 3 },
    { month: 'Nov', suppliers: 5, assessments: 4, highRisk: 4 },
    { month: 'Dec', suppliers: 6, assessments: 5, highRisk: 4 },
    { month: 'Jan', suppliers: 8, assessments: 7, highRisk: 5 },
    { month: 'Feb', suppliers: 9, assessments: 8, highRisk: 5 },
    { month: 'Mar', suppliers: total, assessments: totalAssessments, highRisk: critical + high },
  ]

  const kpiStatus = [
    { kpi: 'Suppliers Assessed',       current: assessed,               target: total,  unit: '',  color: '#22d3ee', pct: coverage   },
    { kpi: 'Assessment Coverage',      current: Math.round(coverage),   target: 100,    unit: '%', color: '#39e75f', pct: coverage   },
    { kpi: 'High Risk Reduction',      current: Math.round(100 - highRiskPct), target: 100, unit: '%', color: '#ffd60a', pct: 100 - highRiskPct },
    { kpi: 'Avg Score Target (<50)',   current: Math.round(avgScore),   target: 50,     unit: '',  color: getScoreColor(avgScore), pct: Math.max(0, 100 - avgScore) },
    { kpi: 'Remediation Rate',         current: low,                    target: total,  unit: '',  color: '#39e75f', pct: total ? (low / total) * 100 : 0 },
  ]

  const remediationData = [
    { name: 'Critical → High', value: Math.max(0, critical - 1), color: '#ff2d55' },
    { name: 'High → Medium',   value: Math.max(0, high - 1),     color: '#ff6b35' },
    { name: 'Medium → Low',    value: 2,                          color: '#ffd60a' },
    { name: 'Already Low',     value: low,                        color: '#39e75f' },
  ]

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(57,231,95,0.15)', border: '1px solid rgba(57,231,95,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target style={{ width: 16, height: 16, color: '#39e75f' }} />
            </div>
            <div>
              <h1 className="page-title">KPI Tracking</h1>
              <div className="page-subtitle">// CITADEL project performance indicators — real-time</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        <KPIGauge value={coverage}               max={100} label="Assessment Coverage"  color="#22d3ee" />
        <KPIGauge value={100 - highRiskPct}      max={100} label="Risk Reduction Rate"  color="#39e75f" />
        <KPIGauge value={Math.max(0, 100 - avgScore)} max={100} label="Score Improvement" color="#ffd60a" />
        <KPIGauge value={totalAssessments}        max={total * 2} label="Total Assessments" color="#a78bfa" unit="" />
        <KPIGauge value={total > 0 ? (assessed / total) * 100 : 0} max={100} label="User Adoption" color="#ff6b35" />
      </div>

      {/* KPI Status Table */}
      <div className="card">
        <div className="section-title">KPI Status vs Targets</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {kpiStatus.map((kpi, i) => {
            const onTarget = kpi.pct >= 70
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${kpi.color}15`, border: `1px solid ${kpi.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {onTarget
                    ? <CheckCircle style={{ width: 14, height: 14, color: '#39e75f' }} />
                    : <Activity style={{ width: 14, height: 14, color: kpi.color }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'rgba(220,235,255,0.75)', marginBottom: '4px' }}>
                    {kpi.kpi}
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${kpi.pct}%`, background: kpi.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem', color: kpi.color }}>
                    {kpi.current}{kpi.unit}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(180,210,255,0.4)' }}>
                    target: {kpi.target}{kpi.unit}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.1em',
                    padding: '3px 10px', borderRadius: '5px',
                    background: onTarget ? 'rgba(57,231,95,0.12)' : 'rgba(255,214,10,0.1)',
                    color: onTarget ? '#39e75f' : '#ffd60a',
                    border: `1px solid ${onTarget ? 'rgba(57,231,95,0.25)' : 'rgba(255,214,10,0.25)'}`,
                  }}>
                    {onTarget ? 'ON TRACK' : 'IN PROGRESS'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

        {/* Adoption trend */}
        <div className="card">
          <div className="section-title">Platform Adoption Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={adoptionTrend}>
              <defs>
                <linearGradient id="suppGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="assGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#39e75f" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#39e75f" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
              <YAxis stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="suppliers"   name="Suppliers"   stroke="#22d3ee" strokeWidth={2} fill="url(#suppGrad)" dot={{ fill: '#22d3ee', r: 3 }} />
              <Area type="monotone" dataKey="assessments" name="Assessments" stroke="#39e75f" strokeWidth={2} fill="url(#assGrad)"  dot={{ fill: '#39e75f', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Remediation pipeline */}
        <div className="card">
          <div className="section-title">Remediation Pipeline</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={remediationData} barSize={36}>
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: 10 }} />
              <YAxis stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="value" name="Suppliers" radius={[6, 6, 0, 0]}>
                {remediationData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project KPIs from document */}
      <div className="card">
        <div className="section-title">CITADEL Project KPIs — Document Reference</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {[
            { kpi: 'Suppliers Assessed',         value: `${assessed}/${total}`,                  color: '#22d3ee', icon: Users,       status: assessed === total ? 'ACHIEVED' : 'IN PROGRESS' },
            { kpi: 'High-Risk Reduction',        value: `${(100 - highRiskPct).toFixed(0)}%`,    color: '#39e75f', icon: TrendingDown, status: highRiskPct < 30 ? 'ACHIEVED' : 'IN PROGRESS'   },
            { kpi: 'Evaluation Time Reduction',  value: '~75%',                                  color: '#a78bfa', icon: Clock,        status: 'ACHIEVED'                                        },
            { kpi: 'Remediation Rate',           value: `${total > 0 ? Math.round((low / total) * 100) : 0}%`, color: '#ffd60a', icon: CheckCircle, status: low > 0 ? 'IN PROGRESS' : 'PENDING' },
            { kpi: 'User Adoption',              value: `${Math.round(coverage)}%`,              color: '#ff6b35', icon: Zap,          status: coverage > 50 ? 'ON TRACK' : 'PENDING'            },
          ].map(item => (
            <div key={item.kpi} style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${item.color}20`, textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <item.icon style={{ width: 14, height: 14, color: item.color }} />
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', color: item.color, marginBottom: '4px' }}>{item.value}</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(220,235,255,0.55)', marginBottom: '6px' }}>{item.kpi}</div>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.58rem', letterSpacing: '0.1em', padding: '2px 8px', borderRadius: '4px', background: item.status === 'ACHIEVED' ? 'rgba(57,231,95,0.12)' : item.status === 'IN PROGRESS' ? 'rgba(255,214,10,0.1)' : 'rgba(255,255,255,0.06)', color: item.status === 'ACHIEVED' ? '#39e75f' : item.status === 'IN PROGRESS' ? '#ffd60a' : 'rgba(255,255,255,0.3)', border: `1px solid ${item.status === 'ACHIEVED' ? 'rgba(57,231,95,0.25)' : item.status === 'IN PROGRESS' ? 'rgba(255,214,10,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}