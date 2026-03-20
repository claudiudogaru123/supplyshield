import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { suppliersApi, assessmentsApi } from '../utils/api'
import type { Question } from '../types'
import { getRiskBadgeClass } from '../utils/helpers'
import {
  ArrowLeft, ArrowRight, CheckCircle, Loader2, Shield,
  ChevronRight, Clock, Zap, BarChart3,
  FileCheck, Target, TrendingDown, Activity
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 75) return '#FF453A'
  if (score >= 50) return '#FF9F0A'
  if (score >= 25) return '#CC8800'
  return '#25A244'
}

function optionColor(pct: number) {
  if (pct === 0)   return '#FF453A'
  if (pct <= 25)   return '#FF9F0A'
  if (pct <= 50)   return '#CC8800'
  if (pct <= 75)   return '#0A84FF'
  return '#25A244'
}

// ── Score Ring ────────────────────────────────────────────
function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const color = scoreColor(score)
  const r     = (size / 2) - 7
  const circ  = 2 * Math.PI * r
  const fill  = circ * (1 - score / 100)
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={fill}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x={size/2} y={size/2 - 3} textAnchor="middle" dominantBaseline="central"
        style={{ fontWeight: 700, fontSize: size * 0.22, fill: color, fontFamily: 'inherit' }}>
        {score.toFixed(0)}
      </text>
      <text x={size/2} y={size/2 + size * 0.18} textAnchor="middle"
        style={{ fontSize: size * 0.1, fill: 'var(--text-ghost)', fontFamily: 'inherit' }}>
        /100
      </text>
    </svg>
  )
}

// ── START SCREEN ──────────────────────────────────────────
function StartScreen({ supplier, onStart, loading }: { supplier: any; onStart: () => void; loading: boolean }) {
  const typeInfo: Record<string, { qs: number; desc: string; color: string }> = {
    IT:     { qs: 10, desc: 'Governance, Access Control, Vulnerability Mgmt, Incident Response', color: '#0A84FF' },
    OT:     { qs: 8,  desc: 'Remote Access, Segmentation, Patch Mgmt, Safety Impact, Monitoring', color: '#BF5AF2' },
    HYBRID: { qs: 16, desc: 'Full IT + OT assessment with all control domains', color: '#25A244' },
  }
  const info = typeInfo[supplier.supplier_type] || typeInfo.IT

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18, margin: '0 auto 1rem',
          background: 'rgba(10,132,255,0.10)', border: '1px solid rgba(10,132,255,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield style={{ width: 26, height: 26, color: 'var(--blue)' }} />
        </div>
        <h1 style={{ fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 6 }}>
          Security Assessment
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Adaptive risk evaluation for <strong style={{ color: 'var(--text-primary)' }}>{supplier.name}</strong>
        </p>
      </div>

      {/* Supplier summary */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
            background: `${info.color}12`, border: `1px solid ${info.color}24`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity style={{ width: 20, height: 20, color: info.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 5, letterSpacing: '-0.01em' }}>
              {supplier.name}
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <span style={{
                fontWeight: 600, fontSize: '0.68rem', padding: '2px 9px', borderRadius: 7,
                background: `${info.color}12`, color: info.color, border: `1px solid ${info.color}25`,
              }}>{supplier.supplier_type}</span>
              <span className={getRiskBadgeClass(supplier.criticality)}>{supplier.criticality}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                {supplier.access_type} access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What to expect */}
      <div className="card">
        <div className="section-title">What This Assessment Covers</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { icon: FileCheck, label: 'Questions',    value: `~${info.qs}`,                                      color: '#25A244' },
            { icon: Clock,     label: 'Est. Time',    value: `${Math.ceil(info.qs * 0.75)} min`,                  color: '#0A84FF' },
            { icon: Target,    label: 'Access Level', value: supplier.access_type,                                color: '#BF5AF2' },
            { icon: BarChart3, label: 'Domains',      value: supplier.supplier_type === 'HYBRID' ? '8' : '5',    color: '#FF9F0A' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <item.icon style={{ width: 16, height: 16, color: item.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Questions are dynamically selected based on supplier type <strong style={{ color: 'var(--text-secondary)' }}>{supplier.supplier_type}</strong>,
          access level <strong style={{ color: 'var(--text-secondary)' }}>{supplier.access_type}</strong>, and criticality. Covers: {info.desc}.
        </p>
      </div>

      {/* Scoring methodology */}
      <div className="card">
        <div className="section-title">Scoring Methodology</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { label: 'Inherent Risk',    desc: 'Based on type, access, criticality', pct: '30%', color: '#FF9F0A' },
            { label: 'Control Maturity', desc: 'Your answers determine this',         pct: '40%', color: '#0A84FF' },
            { label: 'Exposure Factor',  desc: 'Type + access combination',           pct: '30%', color: '#BF5AF2' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <div style={{ width: 3, height: 32, borderRadius: 2, background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: item.color }}>{item.pct}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => window.history.back()} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
          Cancel
        </button>
        <button onClick={onStart} disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center', height: 46, fontSize: '0.9rem' }}>
          {loading
            ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 0.85s linear infinite' }} /> Starting…</>
            : <><Zap style={{ width: 16, height: 16 }} /> Begin Assessment</>
          }
        </button>
      </div>
    </div>
  )
}

// ── RESULT SCREEN ─────────────────────────────────────────
function ResultScreen({ result, supplier, onBack }: { result: any; supplier: any; onBack: () => void }) {
  const navigate = useNavigate()
  const { score, recommendations } = result
  const sc = scoreColor(score.final_score)

  return (
    <div className="page-wrapper">
      {/* Success header */}
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 20, marginBottom: '1.25rem',
          background: 'rgba(48,209,88,0.10)', border: '1px solid rgba(48,209,88,0.22)',
        }}>
          <CheckCircle style={{ width: 14, height: 14, color: '#25A244' }} />
          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#25A244' }}>Assessment Complete</span>
        </div>
        <h1 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
          {supplier.name}
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Risk assessment completed — {new Date().toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* Score + breakdown */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <ScoreRing score={score.final_score} size={120} />
            <div style={{ marginTop: 8 }}>
              <span className={getRiskBadgeClass(score.risk_category)}>{score.risk_category} RISK</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Inherent Risk',    value: score.inherent_risk,    color: '#FF9F0A' },
                { label: 'Control Maturity', value: score.control_maturity, color: '#0A84FF' },
                { label: 'Residual Risk',    value: score.residual_risk,    color: '#CC8800' },
                { label: 'Exposure Factor',  value: score.exposure,         color: '#BF5AF2' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: item.color }}>{item.value.toFixed(1)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {[
              { label: 'Inherent', value: score.inherent_risk, color: '#FF9F0A' },
              { label: 'Residual', value: score.residual_risk, color: '#CC8800' },
              { label: 'Final',    value: score.final_score,   color: sc        },
            ].map(bar => (
              <div key={bar.label} style={{ marginBottom: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>{bar.label}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: bar.color }}>{bar.value.toFixed(1)}</span>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${bar.value}%`, background: bar.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action plan */}
      {recommendations.technical_actions?.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Action Plan</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {recommendations.summary.critical_actions > 0 && <span className="badge-critical">{recommendations.summary.critical_actions} critical</span>}
              {recommendations.summary.high_actions     > 0 && <span className="badge-high">{recommendations.summary.high_actions} high</span>}
              {recommendations.summary.medium_actions   > 0 && <span className="badge-medium">{recommendations.summary.medium_actions} medium</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recommendations.technical_actions.map((action: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: action.priority === 'CRITICAL' ? 'rgba(255,69,58,0.06)'
                          : action.priority === 'HIGH'     ? 'rgba(255,159,10,0.06)'
                          : 'var(--surface)',
                border: `1px solid ${action.priority === 'CRITICAL' ? 'rgba(255,69,58,0.18)'
                          : action.priority === 'HIGH' ? 'rgba(255,159,10,0.18)' : 'var(--border)'}`,
              }}>
                <span className={getRiskBadgeClass(action.priority)} style={{ flexShrink: 0, marginTop: 1 }}>{action.priority}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: 4 }}>{action.action}</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{action.domain}</span>
                    <span style={{ fontSize: '0.7rem', color: action.priority === 'CRITICAL' ? 'var(--red)' : 'var(--text-muted)', fontWeight: 500 }}>⏱ {action.timeline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contractual + next steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <div className="section-title">Contractual Requirements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {recommendations.contractual_requirements?.map((req: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <ChevronRight style={{ width: 12, height: 12, color: 'var(--blue)', flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{req}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Next Steps</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Re-evaluation',  value: recommendations.reevaluation_timeline,  color: '#25A244'  },
              { label: 'Risk Reduction', value: `${score.inherent_risk > 0 ? (((score.inherent_risk - score.residual_risk) / score.inherent_risk) * 100).toFixed(0) : 0}% achieved`, color: '#0A84FF' },
              { label: 'Total Actions',  value: `${recommendations.summary.total_actions} items`, color: '#FF9F0A' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '10px 12px', borderRadius: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                  {item.label}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => navigate(`/suppliers/${supplier.id}`)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
          <TrendingDown style={{ width: 14, height: 14 }} /> View Supplier
        </button>
        <button onClick={() => navigate('/suppliers')} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Registry
        </button>
      </div>
    </div>
  )
}

// ── QUESTION SCREEN ───────────────────────────────────────
function QuestionScreen({ assessment, supplier, onComplete, saving }: {
  assessment: any; supplier: any; onComplete: (answers: Record<string, number>) => void; saving: boolean
}) {
  const [answers,      setAnswers]      = useState<Record<string, number>>(assessment.answers || {})
  const [currentIndex, setCurrentIndex] = useState(0)

  const questions: Question[] = assessment.questions || []
  const total    = questions.length
  const answered = Object.keys(answers).length
  const progress = total > 0 ? (answered / total) * 100 : 0
  const current  = questions[currentIndex]

  const handleAnswer = async (qid: string, value: number) => {
    const updated = { ...answers, [qid]: value }
    setAnswers(updated)
    await assessmentsApi.saveAnswers(assessment.id, updated)
  }

  const canComplete  = answered >= total
  const domains      = [...new Set(questions.map((q: Question) => q.domain))]
  const domainProgress = domains.map(d => ({
    name:  d,
    total: questions.filter((q: Question) => q.domain === d).length,
    done:  questions.filter((q: Question) => q.domain === d && answers[q.id] !== undefined).length,
  }))

  return (
    <>
      <style>{`
        .q-layout { display: grid; grid-template-columns: 220px 1fr; gap: 14px; padding: 1.5rem; height: 100%; }
        @media (max-width: 768px) { .q-layout { grid-template-columns: 1fr; } .q-sidebar { display: none; } }
      `}</style>

      <div className="q-layout">

        {/* SIDEBAR */}
        <div className="q-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Supplier + progress */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: 2, letterSpacing: '-0.01em' }}>
              {supplier.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              {supplier.supplier_type} · {supplier.access_type}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Progress</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#25A244' }}>{answered}/{total}</span>
            </div>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: `${progress}%`, background: '#25A244', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-ghost)', marginTop: 5, textAlign: 'right' }}>
              {progress.toFixed(0)}% complete
            </div>
          </div>

          {/* Domain progress */}
          <div className="card" style={{ padding: '1rem', flex: 1 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-ghost)', marginBottom: 10 }}>
              Domains
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {domainProgress.map(d => {
                const pct      = d.total > 0 ? (d.done / d.total) * 100 : 0
                const isActive = current?.domain === d.name
                return (
                  <div key={d.name} style={{
                    padding: '7px 9px', borderRadius: 9,
                    background: isActive ? 'rgba(10,132,255,0.08)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(10,132,255,0.16)' : 'transparent'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.72rem', color: isActive ? 'var(--blue)' : 'var(--text-muted)', fontWeight: isActive ? 600 : 500 }}>
                        {d.name}
                      </span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: pct === 100 ? '#25A244' : 'var(--text-ghost)' }}>
                        {d.done}/{d.total}
                      </span>
                    </div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#25A244' : 'var(--blue)', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Complete btn */}
          <button
            onClick={() => onComplete(answers)} disabled={!canComplete || saving}
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.84rem', opacity: canComplete ? 1 : 0.4 }}
          >
            {saving
              ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 0.85s linear infinite' }} /> Calculating…</>
              : <><CheckCircle style={{ width: 14, height: 14 }} /> Complete</>
            }
          </button>
          {!canComplete && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-ghost)', textAlign: 'center' }}>
              {total - answered} question{total - answered !== 1 ? 's' : ''} remaining
            </div>
          )}
        </div>

        {/* MAIN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Question nav dots */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {questions.map((q: Question, i: number) => {
              const isAnswered = answers[q.id] !== undefined
              const isCurrent  = i === currentIndex
              return (
                <button key={q.id} onClick={() => setCurrentIndex(i)} style={{
                  width: 28, height: 28, borderRadius: 7,
                  border: `1px solid ${isCurrent ? 'var(--blue)' : isAnswered ? 'rgba(10,132,255,0.22)' : 'var(--border)'}`,
                  cursor: 'pointer', fontSize: '0.65rem', fontWeight: isCurrent || isAnswered ? 700 : 400,
                  transition: 'all 0.15s',
                  background: isCurrent  ? 'var(--blue)'
                            : isAnswered ? 'rgba(10,132,255,0.15)'
                            : 'var(--surface)',
                  color: isCurrent  ? 'white'
                       : isAnswered ? 'var(--blue)'
                       : 'var(--text-muted)',
                }}>
                  {i + 1}
                </button>
              )
            })}
          </div>

          {/* Question card */}
          {current && (
            <div className="card" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontWeight: 600, fontSize: '0.7rem', padding: '3px 10px', borderRadius: 7,
                  background: 'rgba(10,132,255,0.09)', color: 'var(--blue)', border: '1px solid rgba(10,132,255,0.18)',
                }}>
                  {current.domain}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Question {currentIndex + 1} of {total}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-ghost)', fontWeight: 500 }}>
                  Weight: {current.weight}
                </span>
              </div>

              <h2 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {current.text}
              </h2>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {current.options.map(opt => {
                  const isSelected = answers[current.id] === opt.value
                  const pct        = (opt.value / current.max_score) * 100
                  const oc         = optionColor(pct)
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(current.id, opt.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 12,
                        border: `1px solid ${isSelected ? oc + '40' : 'var(--border)'}`,
                        background: isSelected ? `${oc}0D` : 'var(--surface)',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'all 0.15s',
                        boxShadow: isSelected ? `0 0 0 3px ${oc}14` : 'none',
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)' }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: isSelected ? `${oc}14` : 'var(--surface-hover)',
                        border: `1px solid ${isSelected ? oc + '30' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.78rem',
                        color: isSelected ? oc : 'var(--text-muted)',
                      }}>
                        {opt.value}
                      </div>
                      <span style={{
                        flex: 1, fontSize: '0.875rem', lineHeight: 1.45,
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 500 : 400,
                      }}>
                        {opt.label}
                      </span>
                      {isSelected && <CheckCircle style={{ width: 15, height: 15, color: oc, flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}
              className="btn-secondary" style={{ opacity: currentIndex === 0 ? 0.35 : 1 }}>
              <ArrowLeft style={{ width: 14, height: 14 }} /> Previous
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {answered}/{total} answered
            </span>
            {currentIndex < total - 1 ? (
              <button onClick={() => setCurrentIndex(i => Math.min(total - 1, i + 1))} className="btn-primary">
                Next <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            ) : (
              <button onClick={() => onComplete(answers)} disabled={!canComplete || saving} className="btn-primary"
                style={{ opacity: canComplete ? 1 : 0.4 }}>
                {saving
                  ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 0.85s linear infinite' }} /> Calculating…</>
                  : <><CheckCircle style={{ width: 14, height: 14 }} /> Finish</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function AssessmentPage() {
  const { supplierId } = useParams<{ supplierId: string }>()
  const navigate       = useNavigate()
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [result,       setResult]       = useState<any>(null)
  const [saving,       setSaving]       = useState(false)

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => suppliersApi.getOne(supplierId!),
    enabled: !!supplierId,
  })

  const { data: assessment } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => assessmentsApi.get(assessmentId!),
    enabled: !!assessmentId,
  })

  const startMutation = useMutation({
    mutationFn: () => assessmentsApi.start(supplierId!),
    onSuccess: (data) => setAssessmentId(data.id),
  })

  const handleComplete = async (answers: Record<string, number>) => {
    if (!assessmentId) return
    setSaving(true)
    try {
      const data = await assessmentsApi.complete(assessmentId)
      setResult(data)
    } catch { alert('Error completing assessment') }
    finally { setSaving(false) }
  }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <Loader2 style={{ width: 24, height: 24, color: 'var(--blue)', animation: 'spin 0.85s linear infinite' }} />
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loading…</span>
    </div>
  )

  if (!supplier) return null

  if (result)
    return <ResultScreen result={result} supplier={supplier} onBack={() => navigate('/suppliers')} />

  if (!assessmentId || !assessment)
    return <StartScreen supplier={supplier} onStart={() => startMutation.mutate()} loading={startMutation.isPending} />

  return <QuestionScreen assessment={assessment} supplier={supplier} onComplete={handleComplete} saving={saving} />
}