import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { suppliersApi, assessmentsApi } from '../utils/api'
import type { Question } from '../types'
import { getRiskBadgeClass, getScoreColor } from '../utils/helpers'
import {
  ArrowLeft, ArrowRight, CheckCircle, Loader2, Shield,
  ChevronRight, AlertOctagon, Clock, Zap, BarChart3,
  FileCheck, Target, TrendingDown, Activity
} from 'lucide-react'

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const color = getScoreColor(score)
  const r = (size / 2) - 7
  const circ = 2 * Math.PI * r
  const fill = circ * (1 - score / 100)
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={fill}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${color}80)` }}
      />
      <text x={size/2} y={size/2 - 4} textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: size * 0.22, fill: color }}>
        {score.toFixed(0)}
      </text>
      <text x={size/2} y={size/2 + size * 0.18} textAnchor="middle"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: size * 0.1, fill: 'rgba(255,255,255,0.3)' }}>
        /100
      </text>
    </svg>
  )
}

// ── START SCREEN ──────────────────────────────────────────────
function StartScreen({ supplier, onStart, loading }: { supplier: any; onStart: () => void; loading: boolean }) {
  const typeInfo: Record<string, { qs: number; desc: string; color: string }> = {
    IT:     { qs: 10, desc: 'Governance, Access Control, Vulnerability Mgmt, Incident Response', color: '#22d3ee' },
    OT:     { qs: 8,  desc: 'Remote Access, Segmentation, Patch Mgmt, Safety Impact, Monitoring', color: '#a78bfa' },
    HYBRID: { qs: 16, desc: 'Full IT + OT assessment with all control domains', color: '#39e75f' },
  }
  const info = typeInfo[supplier.supplier_type] || typeInfo.IT

  return (
   <div className="page-wrapper">
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 1rem',
          background: 'rgba(57,231,95,0.12)', border: '1px solid rgba(57,231,95,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 32px rgba(57,231,95,0.15)',
        }}>
          <Shield style={{ width: 28, height: 28, color: '#39e75f' }} />
        </div>
        <h1 className="page-title" style={{ marginBottom: '6px' }}>Security Assessment</h1>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>
          Adaptive risk evaluation for {supplier.name}
        </p>
      </div>

      {/* Supplier summary */}
      <div className="card" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
            background: `${info.color}15`, border: `1px solid ${info.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity style={{ width: 20, height: 20, color: info.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: '3px' }}>
              {supplier.name}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.1em', padding: '2px 8px', borderRadius: '5px', background: `${info.color}15`, color: info.color, border: `1px solid ${info.color}30` }}>
                {supplier.supplier_type}
              </span>
              <span className={getRiskBadgeClass(supplier.criticality)}>{supplier.criticality}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {supplier.access_type} access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What to expect */}
      <div className="card">
        <div className="section-title">What This Assessment Covers</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[
            { icon: FileCheck, label: 'Questions', value: `~${info.qs}`, color: '#39e75f' },
            { icon: Clock,     label: 'Est. Time',  value: `${Math.ceil(info.qs * 0.75)} min`, color: '#22d3ee' },
            { icon: Target,    label: 'Access Level', value: supplier.access_type, color: '#a78bfa' },
            { icon: BarChart3, label: 'Domains',    value: supplier.supplier_type === 'HYBRID' ? '8' : '5', color: '#ffd60a' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '9px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <item.icon style={{ width: 16, height: 16, color: item.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: item.color }}>{item.value}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)' }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
          Questions are dynamically selected based on supplier type <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{supplier.supplier_type}</strong>, access level <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{supplier.access_type}</strong>, and criticality. Covers: {info.desc}.
        </p>
      </div>

      {/* Scoring methodology */}
      <div className="card">
        <div className="section-title">Scoring Methodology</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Inherent Risk', desc: 'Based on type, access, criticality', pct: '30%', color: '#ff6b35' },
            { label: 'Control Maturity', desc: 'Your answers determine this', pct: '40%', color: '#22d3ee' },
            { label: 'Exposure Factor', desc: 'Type + access combination', pct: '30%', color: '#a78bfa' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '3px', height: '32px', borderRadius: '2px', background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>{item.label}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', marginTop: '1px' }}>{item.desc}</div>
              </div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', color: item.color }}>{item.pct}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => window.history.back()} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
          Cancel
        </button>
        <button onClick={onStart} disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.875rem', fontSize: '0.9rem' }}>
          {loading
            ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Starting...</>
            : <><Zap style={{ width: 16, height: 16 }} /> Begin Assessment</>}
        </button>
      </div>
    </div>
  )
}

// ── RESULT SCREEN ─────────────────────────────────────────────
function ResultScreen({ result, supplier, onBack }: { result: any; supplier: any; onBack: () => void }) {
  const navigate = useNavigate()
  const { score, recommendations } = result
  const sc = getScoreColor(score.final_score)

  return (
    <div className="page-wrapper">
      {/* Success header */}
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '20px', marginBottom: '1.25rem',
          background: 'rgba(57,231,95,0.1)', border: '1px solid rgba(57,231,95,0.2)',
        }}>
          <CheckCircle style={{ width: 14, height: 14, color: '#39e75f' }} />
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', color: '#39e75f' }}>
            ASSESSMENT COMPLETE
          </span>
        </div>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>{supplier.name}</h1>
        <p className="page-subtitle">Risk assessment completed — {new Date().toLocaleDateString('en-GB')}</p>
      </div>

      {/* Score + breakdown */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <ScoreRing score={score.final_score} size={120} />
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', marginTop: '8px' }}>
              <span className={getRiskBadgeClass(score.risk_category)}>{score.risk_category} RISK</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Inherent Risk',     value: score.inherent_risk,    color: '#ff6b35' },
                { label: 'Control Maturity',  value: score.control_maturity, color: '#22d3ee' },
                { label: 'Residual Risk',     value: score.residual_risk,    color: '#ffd60a' },
                { label: 'Exposure Factor',   value: score.exposure,         color: '#a78bfa' },
              ].map(item => (
                <div key={item.label} style={{ padding: '10px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', color: item.color }}>{item.value.toFixed(1)}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Score bars */}
            {[
              { label: 'Inherent', value: score.inherent_risk, color: '#ff6b35' },
              { label: 'Residual', value: score.residual_risk, color: '#ffd60a' },
              { label: 'Final',    value: score.final_score,   color: sc },
            ].map(bar => (
              <div key={bar.label} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)' }}>{bar.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: bar.color }}>{bar.value.toFixed(1)}</span>
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
            <div style={{ display: 'flex', gap: '6px' }}>
              {recommendations.summary.critical_actions > 0 && <span className="badge-critical">{recommendations.summary.critical_actions} critical</span>}
              {recommendations.summary.high_actions > 0 && <span className="badge-high">{recommendations.summary.high_actions} high</span>}
              {recommendations.summary.medium_actions > 0 && <span className="badge-medium">{recommendations.summary.medium_actions} medium</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                <span className={getRiskBadgeClass(action.priority)} style={{ flexShrink: 0, marginTop: '1px' }}>{action.priority}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: '3px' }}>{action.action}</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)' }}>{action.domain}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: action.priority === 'CRITICAL' ? '#ff2d55' : 'rgba(255,255,255,0.2)' }}>⏱ {action.timeline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contractual + re-evaluation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="card">
          <div className="section-title">Contractual Requirements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {recommendations.contractual_requirements?.map((req: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <ChevronRight style={{ width: 12, height: 12, color: '#39e75f', flexShrink: 0, marginTop: '3px' }} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{req}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Next Steps</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '9px', background: 'rgba(57,231,95,0.05)', border: '1px solid rgba(57,231,95,0.12)' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>RE-EVALUATION</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#39e75f' }}>{recommendations.reevaluation_timeline}</div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>RISK REDUCTION</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#22d3ee' }}>
                {score.inherent_risk > 0 ? (((score.inherent_risk - score.residual_risk) / score.inherent_risk) * 100).toFixed(0) : 0}% achieved
              </div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>TOTAL ACTIONS</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#ffd60a' }}>{recommendations.summary.total_actions} remediation items</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => navigate(`/suppliers/${supplier.id}`)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
          <TrendingDown style={{ width: 14, height: 14 }} /> View Supplier Detail
        </button>
        <button onClick={() => navigate('/suppliers')} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Registry
        </button>
      </div>
    </div>
  )
}

// ── QUESTION SCREEN ───────────────────────────────────────────
function QuestionScreen({ assessment, supplier, onComplete, saving }: {
  assessment: any; supplier: any; onComplete: (answers: Record<string, number>) => void; saving: boolean
}) {
  const [answers, setAnswers] = useState<Record<string, number>>(assessment.answers || {})
  const [currentIndex, setCurrentIndex] = useState(0)

  const questions: Question[] = assessment.questions || []
  const total = questions.length
  const answered = Object.keys(answers).length
  const progress = total > 0 ? (answered / total) * 100 : 0
  const current = questions[currentIndex]

  const handleAnswer = async (qid: string, value: number) => {
    const updated = { ...answers, [qid]: value }
    setAnswers(updated)
    await assessmentsApi.saveAnswers(assessment.id, updated)
  }

  const canComplete = answered >= total

  // Group questions by domain for sidebar
  const domains = [...new Set(questions.map((q: Question) => q.domain))]
  const domainProgress = domains.map(d => ({
    name: d,
    total: questions.filter((q: Question) => q.domain === d).length,
    done: questions.filter((q: Question) => q.domain === d && answers[q.id] !== undefined).length,
  }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px', padding: '1.5rem', height: '100%' }}>

      {/* LEFT SIDEBAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Supplier info */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: 'white', marginBottom: '2px' }}>{supplier.name}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', marginBottom: '10px' }}>
            {supplier.supplier_type} · {supplier.access_type}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>Progress</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#39e75f' }}>{answered}/{total}</span>
          </div>
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{ width: `${progress}%`, background: '#39e75f', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '6px', textAlign: 'right' }}>
            {progress.toFixed(0)}% complete
          </div>
        </div>

        {/* Domain progress */}
        <div className="card" style={{ padding: '1rem', flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
            Domains
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {domainProgress.map(d => {
              const pct = d.total > 0 ? (d.done / d.total) * 100 : 0
              const isActive = current?.domain === d.name
              return (
                <div key={d.name} style={{
                  padding: '8px 10px', borderRadius: '8px',
                  background: isActive ? 'rgba(57,231,95,0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(57,231,95,0.15)' : 'transparent'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: isActive ? '#39e75f' : 'rgba(255,255,255,0.4)', fontWeight: isActive ? 600 : 400 }}>
                      {d.name}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: pct === 100 ? '#39e75f' : 'rgba(255,255,255,0.2)' }}>
                      {d.done}/{d.total}
                    </span>
                  </div>
                  <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#39e75f' : '#22d3ee', transition: 'width 0.3s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Complete button */}
        <button onClick={() => onComplete(answers)} disabled={!canComplete || saving} className="btn-primary"
          style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.82rem', opacity: canComplete ? 1 : 0.4 }}>
          {saving
            ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Calculating...</>
            : <><CheckCircle style={{ width: 14, height: 14 }} /> Complete</>}
        </button>
        {!canComplete && (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
            {total - answered} questions remaining
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Question nav */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {questions.map((q: Question, i: number) => {
            const isAnswered = answers[q.id] !== undefined
            const isCurrent = i === currentIndex
            return (
              <button key={q.id} onClick={() => setCurrentIndex(i)} style={{
                width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace',
                transition: 'all 0.15s',
                background: isCurrent ? '#39e75f' : isAnswered ? 'rgba(57,231,95,0.2)' : 'rgba(255,255,255,0.06)',
                color: isCurrent ? '#040d18' : isAnswered ? '#39e75f' : 'rgba(255,255,255,0.3)',
                fontWeight: isCurrent || isAnswered ? 700 : 400,
              }}>
                {i + 1}
              </button>
            )
          })}
        </div>

        {/* Question card */}
        {current && (
          <div className="card" style={{ flex: 1 }}>
            {/* Domain tag + question number */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <span style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em',
                padding: '3px 10px', borderRadius: '5px',
                background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)',
              }}>
                {current.domain}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                Question {currentIndex + 1} of {total}
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                Weight: {current.weight}
              </span>
            </div>

            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '1rem', color: 'white', lineHeight: 1.55, marginBottom: '1.5rem' }}>
              {current.text}
            </h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {current.options.map(opt => {
                const isSelected = answers[current.id] === opt.value
                const pct = (opt.value / current.max_score) * 100
                const optColor = pct === 0 ? '#ff2d55' : pct <= 25 ? '#ff6b35' : pct <= 50 ? '#ffd60a' : pct <= 75 ? '#22d3ee' : '#39e75f'
                return (
                  <button key={opt.value} onClick={() => handleAnswer(current.id, opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: '10px',
                      border: `1px solid ${isSelected ? optColor + '50' : 'rgba(255,255,255,0.07)'}`,
                      background: isSelected ? `${optColor}10` : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? `0 0 16px ${optColor}20` : 'none',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                      background: isSelected ? `${optColor}20` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSelected ? optColor + '40' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.75rem',
                      color: isSelected ? optColor : 'rgba(255,255,255,0.3)',
                    }}>
                      {opt.value}
                    </div>
                    <span style={{ flex: 1, fontSize: '0.85rem', color: isSelected ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                      {opt.label}
                    </span>
                    {isSelected && <CheckCircle style={{ width: 14, height: 14, color: optColor, flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}
            className="btn-secondary" style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Previous
          </button>

          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)' }}>
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
                ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Calculating...</>
                : <><CheckCircle style={{ width: 14, height: 14 }} /> Finish</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function AssessmentPage() {
  const { supplierId } = useParams<{ supplierId: string }>()
  const navigate = useNavigate()
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
      <Loader2 style={{ width: 24, height: 24, color: '#39e75f', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>LOADING...</span>
    </div>
  )

  if (!supplier) return null

  if (result) return <ResultScreen result={result} supplier={supplier} onBack={() => navigate('/suppliers')} />

  if (!assessmentId || !assessment) {
    return <StartScreen supplier={supplier} onStart={() => startMutation.mutate()} loading={startMutation.isPending} />
  }

  return <QuestionScreen assessment={assessment} supplier={supplier} onComplete={handleComplete} saving={saving} />
}