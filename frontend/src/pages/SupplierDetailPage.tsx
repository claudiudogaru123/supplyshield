import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { suppliersApi, assessmentsApi, recommendationsApi } from '../utils/api'
import { getRiskBadgeClass, formatDate } from '../utils/helpers'
import {
  ArrowLeft, ClipboardList, CheckCircle,
  Shield, Globe, Mail, User, Cpu, Lock, Building,
  TrendingUp, TrendingDown, Activity, Clock, ChevronRight,
  FileText, Zap, AlertOctagon, Loader2
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 75) return '#FF453A'
  if (score >= 50) return '#FF9F0A'
  if (score >= 25) return '#CC8800'
  return '#25A244'
}

// ── Score Ring ────────────────────────────────────────────
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const color = scoreColor(score)
  const r     = (size / 2) - 6
  const circ  = 2 * Math.PI * r
  const fill  = circ * (1 - score / 100)
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={fill}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ fontWeight: 700, fontSize: size * 0.2, fill: color, fontFamily: 'inherit' }}
      >
        {score.toFixed(0)}
      </text>
    </svg>
  )
}

// ── Info Row ──────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, accent = false }: {
  icon: any; label: string; value: string | number; accent?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 10,
      background: 'var(--surface)', border: '1px solid var(--border)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: accent ? 'rgba(10,132,255,0.09)' : 'var(--surface-hover)',
        border: `1px solid ${accent ? 'rgba(10,132,255,0.20)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon style={{ width: 13, height: 13, color: accent ? 'var(--blue)' : 'var(--text-muted)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-ghost)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || '—'}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <Loader2 style={{ width: 24, height: 24, color: 'var(--blue)', animation: 'spin 0.85s linear infinite' }} />
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loading supplier…</span>
    </div>
  )

  if (!supplier) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <Shield style={{ width: 40, height: 40, color: 'var(--text-ghost)' }} />
      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>Supplier not found</span>
      <button onClick={() => navigate('/suppliers')} className="btn-secondary">
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Registry
      </button>
    </div>
  )

  const sc = scoreColor(supplier.risk_score || 0)
  const criticalActions = recommendations?.technical_actions?.filter((a: any) => a.priority === 'CRITICAL') || []
  const highActions     = recommendations?.technical_actions?.filter((a: any) => a.priority === 'HIGH')     || []

  return (
    <>
      <style>{`
        .detail-grid   { display: grid; grid-template-columns: 300px 1fr; gap: 14px; align-items: start; }
        .metrics-grid  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        @media (max-width: 1100px) { .detail-grid  { grid-template-columns: 1fr; } }
        @media (max-width: 900px)  { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .metrics-grid { grid-template-columns: 1fr; } }

        .assess-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          border: 1px solid var(--border); background: var(--surface);
          transition: background 0.15s ease;
        }
        .assess-item:hover { background: var(--surface-hover); }

        .action-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--surface);
        }
      `}</style>

      <div className="page-wrapper">

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/suppliers')} className="btn-ghost" style={{ padding: '8px', marginTop: 2 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {supplier.name}
              </h1>
              <span className={getRiskBadgeClass(supplier.risk_category)}>{supplier.risk_category}</span>
              <span className={getRiskBadgeClass(supplier.criticality)} style={{ opacity: 0.75 }}>{supplier.criticality}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {supplier.supplier_type} Supplier · {supplier.sector} · {supplier.country}
            </div>
          </div>
          <button onClick={() => navigate(`/assessment/${supplier.id}`)} className="btn-primary">
            <ClipboardList style={{ width: 15, height: 15 }} /> Start Assessment
          </button>
        </div>

        {/* ── METRICS ── */}
        <div className="metrics-grid">
          {[
            { label: 'Final Risk Score', value: (supplier.risk_score    || 0).toFixed(1), sub: supplier.risk_category + ' Risk',   color: sc,        icon: Activity,     bar: supplier.risk_score    || 0 },
            { label: 'Inherent Risk',    value: (supplier.inherent_risk || 0).toFixed(1), sub: 'Before controls',                   color: '#FF9F0A',  icon: TrendingUp,   bar: supplier.inherent_risk || 0 },
            { label: 'Residual Risk',    value: (supplier.residual_risk || 0).toFixed(1), sub: 'After controls',                    color: '#CC8800',  icon: TrendingDown, bar: supplier.residual_risk || 0 },
            { label: 'Assessments',      value: supplier.assessment_count || 0,            sub: `${assessments.filter((a: any) => a.status === 'COMPLETED').length} completed`, color: '#0A84FF', icon: FileText, bar: null },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: `${item.color}12`, border: `1px solid ${item.color}24`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <item.icon style={{ width: 15, height: 15, color: item.color }} />
                </div>
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
              {item.bar !== null && (
                <div className="score-bar-track" style={{ marginTop: 10 }}>
                  <div className="score-bar-fill" style={{ width: `${item.bar}%`, background: item.color }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="detail-grid">

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Risk Overview card */}
            <div className="card">
              <div className="section-title">Risk Overview</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                <ScoreRing score={supplier.risk_score || 0} size={88} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.01em' }}>
                    {supplier.risk_category} Risk
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 2 }}>
                    <div>Inherent: <span style={{ fontWeight: 700, color: '#FF9F0A' }}>{(supplier.inherent_risk || 0).toFixed(1)}</span></div>
                    <div>Residual: <span style={{ fontWeight: 700, color: '#CC8800' }}>{(supplier.residual_risk || 0).toFixed(1)}</span></div>
                    <div>Reduction: <span style={{ fontWeight: 700, color: '#25A244' }}>
                      {supplier.inherent_risk
                        ? (((supplier.inherent_risk - supplier.residual_risk) / supplier.inherent_risk) * 100).toFixed(0)
                        : 0}%
                    </span></div>
                  </div>
                </div>
              </div>

              {[
                { label: 'Inherent Risk', value: supplier.inherent_risk || 0, color: '#FF9F0A' },
                { label: 'Residual Risk', value: supplier.residual_risk || 0, color: '#CC8800' },
                { label: 'Final Score',   value: supplier.risk_score    || 0, color: sc       },
              ].map(bar => (
                <div key={bar.label} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>{bar.label}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: bar.color }}>{bar.value.toFixed(1)}</span>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <InfoRow icon={Building}  label="Organization"  value={supplier.name}            accent />
                <InfoRow icon={Globe}     label="Country"       value={supplier.country} />
                <InfoRow icon={Cpu}       label="Type"          value={supplier.supplier_type} />
                <InfoRow icon={Lock}      label="Access Type"   value={supplier.access_type} />
                <InfoRow icon={Shield}    label="Criticality"   value={supplier.criticality} />
                <InfoRow icon={Activity}  label="Sector"        value={supplier.sector} />
                <InfoRow icon={User}      label="Contact"       value={supplier.contact_name  || '—'} />
                <InfoRow icon={Mail}      label="Email"         value={supplier.contact_email || '—'} />
              </div>
              {supplier.description && (
                <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    Description
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{supplier.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Critical banner */}
            {supplier.risk_category === 'CRITICAL' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 14,
                background: 'rgba(255,69,58,0.07)', border: '1px solid rgba(255,69,58,0.22)',
              }}>
                <AlertOctagon style={{ width: 18, height: 18, color: 'var(--red)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--red)' }}>
                    Critical Risk — Immediate Action Required
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,69,58,0.65)', marginTop: 2 }}>
                    {criticalActions.length} critical action{criticalActions.length !== 1 ? 's' : ''} · Re-assessment required within 30 days
                  </div>
                </div>
                <button onClick={() => navigate(`/assessment/${supplier.id}`)} className="btn-danger" style={{ fontSize: '0.78rem', flexShrink: 0 }}>
                  Assess Now
                </button>
              </div>
            )}

            {/* Assessment History */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="section-title" style={{ marginBottom: 0 }}>Assessment History</div>
                <button onClick={() => navigate(`/assessment/${supplier.id}`)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '5px 12px' }}>
                  <Zap style={{ width: 12, height: 12 }} /> New Assessment
                </button>
              </div>

              {assessments.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem', gap: 10, textAlign: 'center' }}>
                  <ClipboardList style={{ width: 36, height: 36, color: 'var(--text-ghost)' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>No assessments yet</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Start the first assessment to calculate the risk score
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {assessments.map((a: any, i: number) => (
                    <div key={a.id} className="assess-item" style={{
                      background: i === 0 ? 'rgba(10,132,255,0.05)' : 'var(--surface)',
                      borderColor: i === 0 ? 'rgba(10,132,255,0.16)' : 'var(--border)',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: a.status === 'COMPLETED' ? 'rgba(48,209,88,0.10)' : 'rgba(255,214,10,0.10)',
                        border: `1px solid ${a.status === 'COMPLETED' ? 'rgba(48,209,88,0.22)' : 'rgba(255,214,10,0.22)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {a.status === 'COMPLETED'
                          ? <CheckCircle style={{ width: 14, height: 14, color: '#25A244' }} />
                          : <Clock       style={{ width: 14, height: 14, color: '#CC8800' }} />
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                            Assessment #{assessments.length - i}
                          </span>
                          {i === 0 && (
                            <span style={{
                              fontSize: '0.62rem', fontWeight: 700,
                              color: 'var(--blue)', background: 'rgba(10,132,255,0.09)',
                              border: '1px solid rgba(10,132,255,0.20)',
                              padding: '1px 7px', borderRadius: 5,
                            }}>Latest</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {formatDate(a.created_at)} · {a.completion_percentage?.toFixed(0)}% complete · {a.status}
                        </div>
                      </div>
                      {a.score > 0 && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: scoreColor(a.score) }}>
                            {a.score.toFixed(1)}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-ghost)', fontWeight: 500 }}>Score</div>
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
                  <div style={{ display: 'flex', gap: 6 }}>
                    {criticalActions.length > 0 && <span className="badge-critical">{criticalActions.length} critical</span>}
                    {highActions.length     > 0 && <span className="badge-high">{highActions.length} high</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
                  {recommendations.technical_actions.map((action: any, i: number) => (
                    <div key={i} className="action-item" style={{
                      background: action.priority === 'CRITICAL' ? 'rgba(255,69,58,0.06)'
                                : action.priority === 'HIGH'     ? 'rgba(255,159,10,0.06)'
                                : 'var(--surface)',
                      borderColor: action.priority === 'CRITICAL' ? 'rgba(255,69,58,0.18)'
                                 : action.priority === 'HIGH'     ? 'rgba(255,159,10,0.18)'
                                 : 'var(--border)',
                    }}>
                      <span className={getRiskBadgeClass(action.priority)} style={{ flexShrink: 0, marginTop: 1 }}>
                        {action.priority}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: 4 }}>
                          {action.action}
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{action.domain}</span>
                          <span style={{ fontSize: '0.7rem', color: action.priority === 'CRITICAL' ? 'var(--red)' : 'var(--text-muted)', fontWeight: 500 }}>
                            ⏱ {action.timeline}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {recommendations.contractual_requirements?.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                      Contractual Requirements
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {recommendations.contractual_requirements.map((req: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <ChevronRight style={{ width: 12, height: 12, color: 'var(--blue)', flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{req}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: 10, padding: '8px 12px', borderRadius: 9,
                      background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.15)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Clock style={{ width: 13, height: 13, color: 'var(--blue)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Re-evaluation in: <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{recommendations.reevaluation_timeline}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No assessment CTA */}
            {!recommendations && supplier.assessment_count === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                <Shield style={{ width: 44, height: 44, color: 'var(--text-ghost)', margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  No Risk Data Available
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                  Complete an assessment to generate the risk score, recommendations, and remediation plan for this supplier.
                </p>
                <button onClick={() => navigate(`/assessment/${supplier.id}`)} className="btn-primary">
                  <ClipboardList style={{ width: 15, height: 15 }} /> Start Assessment Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}