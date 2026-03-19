import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { suppliersApi, assessmentsApi, recommendationsApi } from '../utils/api'
import { getRiskBadgeClass, getScoreColor, formatDate } from '../utils/helpers'
import {
  ArrowLeft, ClipboardList, AlertTriangle, CheckCircle,
  Shield, Globe, Mail, User, Cpu, Lock, Building,
  TrendingUp, TrendingDown, Activity, Clock, ChevronRight,
  FileText, Zap, AlertOctagon, Loader2
} from 'lucide-react'

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const color = getScoreColor(score)
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const fill = circ * (1 - score / 100)
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={fill}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: size * 0.2, fill: color }}>
        {score.toFixed(0)}
      </text>
    </svg>
  )
}

function InfoRow({ icon: Icon, label, value, accent = false }: {
  icon: any; label: string; value: string | number; accent?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 12px', borderRadius: '9px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
        background: accent ? 'rgba(57,231,95,0.12)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${accent ? 'rgba(57,231,95,0.2)' : 'rgba(255,255,255,0.07)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon style={{ width: 13, height: 13, color: accent ? '#39e75f' : 'rgba(255,255,255,0.35)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || '—'}
        </div>
      </div>
    </div>
  )
}

export default function SupplierDetailPage() {
  const { supplierId } = useParams<{ supplierId: string }>()
  const navigate = useNavigate()

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => suppliersApi.getOne(supplierId!),
    enabled: !!supplierId,
  })

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments', supplierId],
    queryFn: () => assessmentsApi.list(supplierId!),
    enabled: !!supplierId,
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', supplierId],
    queryFn: () => recommendationsApi.get(supplierId!),
    enabled: !!supplierId && supplier?.assessment_count > 0,
  })

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
      <Loader2 style={{ width: 24, height: 24, color: '#39e75f', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
        LOADING SUPPLIER...
      </span>
    </div>
  )

  if (!supplier) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
      <Shield style={{ width: 40, height: 40, color: 'rgba(255,255,255,0.1)' }} />
      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>
        SUPPLIER NOT FOUND
      </span>
      <button onClick={() => navigate('/suppliers')} className="btn-secondary">
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Registry
      </button>
    </div>
  )

  const sc = getScoreColor(supplier.risk_score || 0)
  const criticalActions = recommendations?.technical_actions?.filter((a: any) => a.priority === 'CRITICAL') || []
  const highActions = recommendations?.technical_actions?.filter((a: any) => a.priority === 'HIGH') || []

  return (
    <div className="page-wrapper">

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/suppliers')} className="btn-ghost" style={{ padding: '8px', marginTop: '2px' }}>
          <ArrowLeft style={{ width: 16, height: 16 }} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 className="page-title">{supplier.name}</h1>
            <span className={getRiskBadgeClass(supplier.risk_category)}>{supplier.risk_category}</span>
            <span className={getRiskBadgeClass(supplier.criticality)} style={{ opacity: 0.7 }}>{supplier.criticality}</span>
          </div>
          <div className="page-subtitle">
            {supplier.supplier_type} Supplier · {supplier.sector} · {supplier.country}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={() => navigate(`/assessment/${supplier.id}`)} className="btn-primary">
            <ClipboardList style={{ width: 15, height: 15 }} /> Start Assessment
          </button>
        </div>
      </div>

      {/* ── TOP METRICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {[
          {
            label: 'Final Risk Score',
            value: (supplier.risk_score || 0).toFixed(1),
            sub: supplier.risk_category + ' RISK',
            color: sc,
            icon: Activity,
            bar: supplier.risk_score || 0,
          },
          {
            label: 'Inherent Risk',
            value: (supplier.inherent_risk || 0).toFixed(1),
            sub: 'Before controls',
            color: '#ff6b35',
            icon: TrendingUp,
            bar: supplier.inherent_risk || 0,
          },
          {
            label: 'Residual Risk',
            value: (supplier.residual_risk || 0).toFixed(1),
            sub: 'After controls',
            color: '#ffd60a',
            icon: TrendingDown,
            bar: supplier.residual_risk || 0,
          },
          {
            label: 'Assessments',
            value: supplier.assessment_count || 0,
            sub: assessments.filter((a: any) => a.status === 'COMPLETED').length + ' completed',
            color: '#22d3ee',
            icon: FileText,
            bar: null,
          },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: `${item.color}15`, border: `1px solid ${item.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon style={{ width: 15, height: 15, color: item.color }} />
              </div>
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
            {item.bar !== null && (
              <div className="score-bar-track" style={{ marginTop: '10px' }}>
                <div className="score-bar-fill" style={{ width: `${item.bar}%`, background: item.color }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '12px', alignItems: 'start' }}>

        {/* LEFT COL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Risk Overview */}
          <div className="card">
            <div className="section-title">Risk Overview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              <ScoreRing score={supplier.risk_score || 0} size={90} />
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: '4px' }}>
                  {supplier.risk_category} RISK
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.8 }}>
                  <div>Inherent: <span style={{ color: '#ff6b35' }}>{(supplier.inherent_risk || 0).toFixed(1)}</span></div>
                  <div>Residual: <span style={{ color: '#ffd60a' }}>{(supplier.residual_risk || 0).toFixed(1)}</span></div>
                  <div>Reduction: <span style={{ color: '#39e75f' }}>
                    {supplier.inherent_risk ? (((supplier.inherent_risk - supplier.residual_risk) / supplier.inherent_risk) * 100).toFixed(0) : 0}%
                  </span></div>
                </div>
              </div>
            </div>

            {/* Risk breakdown bars */}
            {[
              { label: 'Inherent Risk', value: supplier.inherent_risk || 0, color: '#ff6b35' },
              { label: 'Residual Risk', value: supplier.residual_risk || 0, color: '#ffd60a' },
              { label: 'Final Score',   value: supplier.risk_score || 0,    color: sc },
            ].map(bar => (
              <div key={bar.label} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)' }}>{bar.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: bar.color }}>{bar.value.toFixed(1)}</span>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${bar.value}%`, background: bar.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Supplier Profile */}
          <div className="card">
            <div className="section-title">Supplier Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <InfoRow icon={Building}  label="Organization"  value={supplier.name}          accent />
              <InfoRow icon={Globe}     label="Country"       value={supplier.country} />
              <InfoRow icon={Cpu}       label="Type"          value={supplier.supplier_type} />
              <InfoRow icon={Lock}      label="Access Type"   value={supplier.access_type} />
              <InfoRow icon={Shield}    label="Criticality"   value={supplier.criticality} />
              <InfoRow icon={Activity}  label="Sector"        value={supplier.sector} />
              <InfoRow icon={User}      label="Contact"       value={supplier.contact_name || '—'} />
              <InfoRow icon={Mail}      label="Email"         value={supplier.contact_email || '—'} />
            </div>
            {supplier.description && (
              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Description</div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{supplier.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Alert banner if critical */}
          {supplier.risk_category === 'CRITICAL' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', borderRadius: '12px',
              background: 'rgba(255,45,85,0.08)',
              border: '1px solid rgba(255,45,85,0.25)',
            }}>
              <AlertOctagon style={{ width: 18, height: 18, color: '#ff2d55', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#ff7a95', letterSpacing: '0.05em' }}>
                  CRITICAL RISK — IMMEDIATE ACTION REQUIRED
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,45,85,0.6)', marginTop: '2px' }}>
                  {criticalActions.length} critical actions · Re-assessment required within 30 days
                </div>
              </div>
              <button onClick={() => navigate(`/assessment/${supplier.id}`)} className="btn-danger" style={{ marginLeft: 'auto', fontSize: '0.72rem', flexShrink: 0 }}>
                Assess Now
              </button>
            </div>
          )}

          {/* Assessment History */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Assessment History</div>
              <button onClick={() => navigate(`/assessment/${supplier.id}`)} className="btn-primary" style={{ fontSize: '0.72rem', padding: '5px 12px' }}>
                <Zap style={{ width: 12, height: 12 }} /> New Assessment
              </button>
            </div>

            {assessments.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem', gap: '10px' }}>
                <ClipboardList style={{ width: 36, height: 36, color: 'rgba(255,255,255,0.08)' }} />
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>
                  NO ASSESSMENTS YET
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.12)' }}>
                  Start the first assessment to calculate the risk score
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {assessments.map((a: any, i: number) => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '10px',
                    background: i === 0 ? 'rgba(57,231,95,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${i === 0 ? 'rgba(57,231,95,0.12)' : 'rgba(255,255,255,0.05)'}`,
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      background: a.status === 'COMPLETED' ? 'rgba(57,231,95,0.12)' : 'rgba(255,214,10,0.1)',
                      border: `1px solid ${a.status === 'COMPLETED' ? 'rgba(57,231,95,0.2)' : 'rgba(255,214,10,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {a.status === 'COMPLETED'
                        ? <CheckCircle style={{ width: 14, height: 14, color: '#39e75f' }} />
                        : <Clock style={{ width: 14, height: 14, color: '#ffd60a' }} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                          Assessment #{assessments.length - i}
                        </span>
                        {i === 0 && (
                          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.58rem', letterSpacing: '0.1em', color: '#39e75f', background: 'rgba(57,231,95,0.1)', border: '1px solid rgba(57,231,95,0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                            LATEST
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                        {formatDate(a.created_at)} · {a.completion_percentage?.toFixed(0)}% complete · {a.status}
                      </div>
                    </div>

                    {a.score > 0 && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.2rem', color: getScoreColor(a.score) }}>
                          {a.score.toFixed(1)}
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)' }}>SCORE</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {recommendations && recommendations.technical_actions?.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="section-title" style={{ marginBottom: 0 }}>Remediation Actions</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {criticalActions.length > 0 && (
                    <span className="badge-critical">{criticalActions.length} critical</span>
                  )}
                  {highActions.length > 0 && (
                    <span className="badge-high">{highActions.length} high</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                {recommendations.technical_actions.map((action: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '10px 12px', borderRadius: '9px',
                    background: action.priority === 'CRITICAL' ? 'rgba(255,45,85,0.07)'
                      : action.priority === 'HIGH' ? 'rgba(255,107,53,0.07)'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${
                      action.priority === 'CRITICAL' ? 'rgba(255,45,85,0.18)'
                      : action.priority === 'HIGH' ? 'rgba(255,107,53,0.18)'
                      : 'rgba(255,255,255,0.05)'}`,
                  }}>
                    <span className={getRiskBadgeClass(action.priority)} style={{ flexShrink: 0, marginTop: '1px' }}>
                      {action.priority}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: '3px' }}>
                        {action.action}
                      </p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)' }}>
                          {action.domain}
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: action.priority === 'CRITICAL' ? '#ff2d55' : 'rgba(255,255,255,0.2)' }}>
                          ⏱ {action.timeline}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contractual requirements */}
              {recommendations.contractual_requirements?.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Contractual Requirements
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {recommendations.contractual_requirements.map((req: string, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <ChevronRight style={{ width: 12, height: 12, color: '#39e75f', flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{req}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(57,231,95,0.05)', border: '1px solid rgba(57,231,95,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock style={{ width: 13, height: 13, color: '#39e75f', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>
                      Re-evaluation in: <span style={{ color: '#39e75f' }}>{recommendations.reevaluation_timeline}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No assessment yet CTA */}
          {!recommendations && supplier.assessment_count === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <Shield style={{ width: 44, height: 44, color: 'rgba(255,255,255,0.08)', margin: '0 auto 1rem' }} />
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                NO RISK DATA AVAILABLE
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Complete an assessment to generate the risk score, recommendations, and remediation plan for this supplier.
              </p>
              <button onClick={() => navigate(`/assessment/${supplier.id}`)} className="btn-primary" style={{ fontSize: '0.82rem' }}>
                <ClipboardList style={{ width: 15, height: 15 }} /> Start Assessment Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}