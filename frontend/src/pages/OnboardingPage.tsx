import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { suppliersApi } from '../utils/api'
import { useQueryClient } from '@tanstack/react-query'
import {
  Building, Globe, Cpu, Shield, Mail, User,
  FileText, CheckCircle, ChevronRight, ArrowLeft,
  AlertTriangle, Zap, ClipboardList, Loader2
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info',     icon: Building, desc: 'Company details'       },
  { id: 2, label: 'Classification', icon: Cpu,      desc: 'Type & access profile' },
  { id: 3, label: 'Risk Profile',   icon: Shield,   desc: 'Criticality assessment'},
  { id: 4, label: 'Contact',        icon: User,     desc: 'Contact information'   },
  { id: 5, label: 'Review',         icon: FileText, desc: 'Confirm & submit'      },
]

const RISK_MATRIX: Record<string, Record<string, string>> = {
  PRIVILEGED: { CRITICAL: 'CRITICAL', HIGH: 'CRITICAL', MEDIUM: 'HIGH',   LOW: 'MEDIUM' },
  REMOTE:     { CRITICAL: 'CRITICAL', HIGH: 'HIGH',     MEDIUM: 'MEDIUM', LOW: 'LOW'    },
  PHYSICAL:   { CRITICAL: 'HIGH',     HIGH: 'HIGH',     MEDIUM: 'MEDIUM', LOW: 'LOW'    },
  NONE:       { CRITICAL: 'MEDIUM',   HIGH: 'LOW',      MEDIUM: 'LOW',    LOW: 'LOW'    },
}

const RISK_COLOR: Record<string, string> = {
  CRITICAL: '#FF453A', HIGH: '#FF9F0A', MEDIUM: '#CC8800', LOW: '#25A244', '—': 'var(--text-ghost)',
}
const RISK_BG: Record<string, string> = {
  CRITICAL: 'rgba(255,69,58,0.07)', HIGH: 'rgba(255,159,10,0.07)', MEDIUM: 'rgba(255,214,10,0.07)', LOW: 'rgba(48,209,88,0.07)', '—': 'var(--surface)',
}
const RISK_BORDER: Record<string, string> = {
  CRITICAL: 'rgba(255,69,58,0.22)', HIGH: 'rgba(255,159,10,0.22)', MEDIUM: 'rgba(255,214,10,0.25)', LOW: 'rgba(48,209,88,0.22)', '—': 'var(--border)',
}

// ── Step indicator ────────────────────────────────────────
function StepIndicator({ steps, current }: { steps: typeof STEPS; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', overflowX: 'auto', paddingBottom: 4 }}>
      {steps.map((step, i) => {
        const done   = current > step.id
        const active = current === step.id
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done    ? 'var(--blue)'
                          : active  ? 'rgba(10,132,255,0.12)'
                          : 'var(--surface)',
                border: `2px solid ${done || active ? 'var(--blue)' : 'var(--border)'}`,
                transition: 'all 0.3s ease',
                boxShadow: active ? '0 0 0 4px rgba(10,132,255,0.14)' : 'none',
              }}>
                {done
                  ? <CheckCircle style={{ width: 16, height: 16, color: 'white' }} />
                  : <step.icon   style={{ width: 14, height: 14, color: active ? 'var(--blue)' : 'var(--text-muted)' }} />
                }
              </div>
              <div style={{
                fontSize: '0.65rem', fontWeight: 600,
                color: active ? 'var(--blue)' : done ? 'var(--text-secondary)' : 'var(--text-ghost)',
                whiteSpace: 'nowrap', letterSpacing: '0.02em',
              }}>
                {step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 8px', marginBottom: 22,
                background: done ? 'var(--blue)' : 'var(--border)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Option button (type / access / criticality) ───────────
function OptionBtn({ val, selected, color, title, desc, onClick }: {
  val: string; selected: boolean; color: string; title: string; desc: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      padding: '14px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
      background: selected ? `${color}10` : 'var(--surface)',
      border: `2px solid ${selected ? color : 'var(--border)'}`,
      transition: 'all 0.18s ease',
      boxShadow: selected ? `0 0 0 3px ${color}18` : 'none',
    }}>
      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: selected ? color : 'var(--text-secondary)', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const [step,       setStep]      = useState(1)
  const [loading,    setLoading]   = useState(false)
  const [done,       setDone]      = useState(false)
  const [createdId,  setCreatedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '', country: '', sector: '', description: '',
    supplier_type: '', access_type: '', criticality: '',
    contact_name: '', contact_email: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const estimatedRisk = form.access_type && form.criticality
    ? RISK_MATRIX[form.access_type]?.[form.criticality] || '—'
    : '—'

  const canNext = () => {
    if (step === 1) return form.name && form.country && form.sector
    if (step === 2) return form.supplier_type && form.access_type
    if (step === 3) return form.criticality
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await suppliersApi.create(form)
      setCreatedId(result.id)
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setDone(true)
    } catch { alert('Error creating supplier') }
    finally { setLoading(false) }
  }

  const resetForm = () => {
    setDone(false); setStep(1)
    setForm({ name: '', country: '', sector: '', description: '', supplier_type: '', access_type: '', criticality: '', contact_name: '', contact_email: '' })
  }

  // ── SUCCESS SCREEN ──────────────────────────────────────
  if (done && createdId) {
    const rc = RISK_COLOR[estimatedRisk]
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(48,209,88,0.10)', border: '2px solid #25A244',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 0 8px rgba(48,209,88,0.07)',
          }}>
            <CheckCircle style={{ width: 28, height: 28, color: '#25A244' }} />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 8 }}>
            Supplier Onboarded!
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{form.name}</strong> has been registered with estimated risk level{' '}
            <strong style={{ color: rc }}>{estimatedRisk}</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '2rem', textAlign: 'left' }}>
            {[
              { label: 'Type',        value: form.supplier_type },
              { label: 'Access',      value: form.access_type   },
              { label: 'Criticality', value: form.criticality   },
              { label: 'Est. Risk',   value: estimatedRisk,     color: rc },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: item.color || 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => navigate(`/assessment/${createdId}`)} className="btn-primary" style={{ justifyContent: 'center', height: 46, fontSize: '0.9rem' }}>
              <Zap style={{ width: 15, height: 15 }} /> Start Assessment Now
            </button>
            <button onClick={() => navigate(`/suppliers/${createdId}`)} className="btn-secondary" style={{ justifyContent: 'center' }}>
              <ClipboardList style={{ width: 14, height: 14 }} /> View Supplier Profile
            </button>
            <button onClick={resetForm} className="btn-ghost" style={{ justifyContent: 'center' }}>
              + Onboard Another Supplier
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── ONBOARDING FORM ─────────────────────────────────────
  return (
    <>
      <style>{`
        .ob-form  { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .ob-type  { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
        .ob-acc   { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .ob-crit  { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .ob-rev   { display: grid; grid-template-columns: 1fr 1fr;       gap: 8px; }
        @media (max-width: 700px) {
          .ob-form { grid-template-columns: 1fr; }
          .ob-type { grid-template-columns: 1fr; }
          .ob-acc  { grid-template-columns: repeat(2,1fr); }
          .ob-crit { grid-template-columns: repeat(2,1fr); }
          .ob-rev  { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-wrapper">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/suppliers')} className="btn-ghost" style={{ padding: 8 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Supplier Onboarding
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
              Guided registration — step {step} of {STEPS.length}
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={STEPS} current={step} />

        {/* Step content */}
        <div className="card" style={{ minHeight: 320 }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div className="section-title">Company Information</div>
              <div className="ob-form">
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Company Name *</label>
                  <div style={{ position: 'relative' }}>
                    <Building style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
                    <input className="input" style={{ paddingLeft: 36 }} placeholder="e.g. Siemens Energy Romania SRL"
                      value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Country *</label>
                  <div style={{ position: 'relative' }}>
                    <Globe style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
                    <input className="input" style={{ paddingLeft: 36 }} placeholder="Romania"
                      value={form.country} onChange={e => set('country', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Sector *</label>
                  <select className="input" value={form.sector} onChange={e => set('sector', e.target.value)}>
                    <option value="">Select sector…</option>
                    {['Energy','Manufacturing','IT Services','Cloud Services','Industrial Automation','Network Security','Cybersecurity','Data Management','Utilities','Transport','Healthcare','Finance'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Description</label>
                  <textarea className="input" placeholder="Brief description of services provided…" rows={3}
                    value={form.description} onChange={e => set('description', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div className="section-title">Supplier Classification</div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Supplier Type *</label>
                <div className="ob-type">
                  {[
                    { val: 'IT',     title: 'IT',     desc: 'Software, cloud, IT services',  color: '#0A84FF' },
                    { val: 'OT',     title: 'OT',     desc: 'Industrial, SCADA, PLC, HMI',   color: '#BF5AF2' },
                    { val: 'HYBRID', title: 'Hybrid', desc: 'Both IT and OT components',     color: '#25A244' },
                  ].map(opt => (
                    <OptionBtn key={opt.val} val={opt.val} selected={form.supplier_type === opt.val}
                      color={opt.color} title={opt.title} desc={opt.desc}
                      onClick={() => set('supplier_type', opt.val)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Access Type *</label>
                <div className="ob-acc">
                  {[
                    { val: 'NONE',       title: 'No Access',  desc: 'No system access',      color: '#25A244' },
                    { val: 'PHYSICAL',   title: 'Physical',   desc: 'On-site access only',   color: '#0A84FF' },
                    { val: 'REMOTE',     title: 'Remote',     desc: 'VPN/remote connection', color: '#CC8800' },
                    { val: 'PRIVILEGED', title: 'Privileged', desc: 'Admin/root access',     color: '#FF453A' },
                  ].map(opt => (
                    <OptionBtn key={opt.val} val={opt.val} selected={form.access_type === opt.val}
                      color={opt.color} title={opt.title} desc={opt.desc}
                      onClick={() => set('access_type', opt.val)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div className="section-title">Criticality Assessment</div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Operational Criticality *</label>
                <div className="ob-crit">
                  {[
                    { val: 'LOW',      title: 'Low',      desc: 'Minimal impact if unavailable',         color: '#25A244' },
                    { val: 'MEDIUM',   title: 'Medium',   desc: 'Moderate operational impact',           color: '#CC8800' },
                    { val: 'HIGH',     title: 'High',     desc: 'Significant operational disruption',    color: '#FF9F0A' },
                    { val: 'CRITICAL', title: 'Critical', desc: 'Essential — failure = major incident',  color: '#FF453A' },
                  ].map(opt => (
                    <OptionBtn key={opt.val} val={opt.val} selected={form.criticality === opt.val}
                      color={opt.color} title={opt.title} desc={opt.desc}
                      onClick={() => set('criticality', opt.val)} />
                  ))}
                </div>
              </div>

              {form.criticality && form.access_type && (
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: RISK_BG[estimatedRisk], border: `1px solid ${RISK_BORDER[estimatedRisk]}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <AlertTriangle style={{ width: 17, height: 17, color: RISK_COLOR[estimatedRisk], flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: RISK_COLOR[estimatedRisk], marginBottom: 3 }}>
                      Estimated Initial Risk: {estimatedRisk}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Based on {form.access_type} access + {form.criticality} criticality · actual score calculated after assessment
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div className="section-title">Contact Information</div>
              <div className="ob-form">
                <div>
                  <label className="label">Contact Name</label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
                    <input className="input" style={{ paddingLeft: 36 }} placeholder="John Doe"
                      value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Contact Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
                    <input className="input" style={{ paddingLeft: 36 }} placeholder="contact@company.com"
                      value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '12px 16px', borderRadius: 10, background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.15)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Contact details are optional but recommended for follow-up on remediation actions and re-assessments.
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div>
              <div className="section-title">Review & Confirm</div>
              <div className="ob-rev" style={{ marginBottom: '1.5rem' }}>
                {[
                  { label: 'Company Name', value: form.name              },
                  { label: 'Country',      value: form.country           },
                  { label: 'Sector',       value: form.sector            },
                  { label: 'Type',         value: form.supplier_type     },
                  { label: 'Access Type',  value: form.access_type       },
                  { label: 'Criticality',  value: form.criticality       },
                  { label: 'Contact',      value: form.contact_name  || '—' },
                  { label: 'Email',        value: form.contact_email || '—' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 10,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '14px 16px', borderRadius: 12,
                background: RISK_BG[estimatedRisk], border: `1px solid ${RISK_BORDER[estimatedRisk]}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Shield style={{ width: 17, height: 17, color: RISK_COLOR[estimatedRisk], flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: RISK_COLOR[estimatedRisk], marginBottom: 3 }}>
                    Estimated Initial Risk: {estimatedRisk}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    An assessment is recommended immediately after onboarding
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/suppliers')} className="btn-secondary">
            <ArrowLeft style={{ width: 14, height: 14 }} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map(s => (
              <div key={s.id} style={{
                width:  step === s.id ? 20 : 6,
                height: 6, borderRadius: 3,
                background: step >= s.id ? 'var(--blue)' : 'var(--border)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>

          {step < 5 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary"
              style={{ opacity: canNext() ? 1 : 0.4 }}>
              Next <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
              {loading
                ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 0.85s linear infinite' }} /> Saving…</>
                : <><CheckCircle style={{ width: 14, height: 14 }} /> Complete Onboarding</>
              }
            </button>
          )}
        </div>
      </div>
    </>
  )
}