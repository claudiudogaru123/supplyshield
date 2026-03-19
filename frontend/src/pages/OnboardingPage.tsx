import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { suppliersApi } from '../utils/api'
import { useQueryClient } from '@tanstack/react-query'
import {
  Building, Globe, Cpu, Lock, Shield, Mail, User,
  FileText, CheckCircle, ChevronRight, ArrowLeft,
  AlertTriangle, Zap, ClipboardList, Loader2
} from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Basic Info',    icon: Building,      desc: 'Company details'          },
  { id: 2, label: 'Classification', icon: Cpu,          desc: 'Type & access profile'    },
  { id: 3, label: 'Risk Profile',  icon: Shield,        desc: 'Criticality assessment'   },
  { id: 4, label: 'Contact',       icon: User,          desc: 'Contact information'      },
  { id: 5, label: 'Review',        icon: FileText,      desc: 'Confirm & submit'         },
]

const RISK_MATRIX: Record<string, Record<string, string>> = {
  PRIVILEGED: { CRITICAL: 'CRITICAL', HIGH: 'CRITICAL', MEDIUM: 'HIGH',   LOW: 'MEDIUM' },
  REMOTE:     { CRITICAL: 'CRITICAL', HIGH: 'HIGH',     MEDIUM: 'MEDIUM', LOW: 'LOW'    },
  PHYSICAL:   { CRITICAL: 'HIGH',     HIGH: 'HIGH',     MEDIUM: 'MEDIUM', LOW: 'LOW'    },
  NONE:       { CRITICAL: 'MEDIUM',   HIGH: 'LOW',      MEDIUM: 'LOW',    LOW: 'LOW'    },
}

function StepIndicator({ steps, current }: { steps: typeof STEPS; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2rem' }}>
      {steps.map((step, i) => {
        const done    = current > step.id
        const active  = current === step.id
        const pending = current < step.id
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#39e75f' : active ? 'rgba(57,231,95,0.15)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${done ? '#39e75f' : active ? '#39e75f' : 'rgba(255,255,255,0.1)'}`,
                transition: 'all 0.3s',
                boxShadow: active ? '0 0 16px rgba(57,231,95,0.3)' : 'none',
              }}>
                {done
                  ? <CheckCircle style={{ width: 16, height: 16, color: '#040d18' }} />
                  : <step.icon style={{ width: 14, height: 14, color: active ? '#39e75f' : 'rgba(255,255,255,0.25)' }} />}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? '#39e75f' : done ? 'rgba(220,235,255,0.7)' : 'rgba(180,210,255,0.35)', whiteSpace: 'nowrap' }}>
                  {step.label}
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', margin: '0 8px', marginBottom: '22px', background: done ? '#39e75f' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '', country: '', sector: '', description: '',
    supplier_type: '', access_type: '', criticality: '',
    contact_name: '', contact_email: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const estimatedRisk = form.access_type && form.criticality
    ? RISK_MATRIX[form.access_type]?.[form.criticality] || '—'
    : '—'

  const riskColor: Record<string, string> = {
    CRITICAL: '#ff2d55', HIGH: '#ff6b35', MEDIUM: '#ffd60a', LOW: '#39e75f', '—': 'rgba(255,255,255,0.3)'
  }

  const canNext = () => {
    if (step === 1) return form.name && form.country && form.sector
    if (step === 2) return form.supplier_type && form.access_type
    if (step === 3) return form.criticality
    if (step === 4) return true
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

  // SUCCESS SCREEN
  if (done && createdId) {
    return (
     <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(57,231,95,0.15)', border: '2px solid #39e75f', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 32px rgba(57,231,95,0.25)' }}>
            <CheckCircle style={{ width: 28, height: 28, color: '#39e75f' }} />
          </div>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: 'white', letterSpacing: '0.06em', marginBottom: '8px' }}>
            SUPPLIER ONBOARDED
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(220,235,255,0.55)', lineHeight: 1.6, marginBottom: '2rem' }}>
            <strong style={{ color: 'rgba(220,235,255,0.8)' }}>{form.name}</strong> has been successfully registered in the system with estimated risk level{' '}
            <strong style={{ color: riskColor[estimatedRisk] }}>{estimatedRisk}</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '2rem' }}>
            {[
              { label: 'Type',        value: form.supplier_type },
              { label: 'Access',      value: form.access_type   },
              { label: 'Criticality', value: form.criticality   },
              { label: 'Est. Risk',   value: estimatedRisk, color: riskColor[estimatedRisk] },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(180,210,255,0.42)', textTransform: 'uppercase', marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: item.color || 'rgba(220,235,255,0.75)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => navigate(`/assessment/${createdId}`)} className="btn-primary" style={{ justifyContent: 'center', padding: '0.875rem', fontSize: '0.88rem' }}>
              <Zap style={{ width: 15, height: 15 }} /> Start Assessment Now
            </button>
            <button onClick={() => navigate(`/suppliers/${createdId}`)} className="btn-secondary" style={{ justifyContent: 'center' }}>
              <ClipboardList style={{ width: 14, height: 14 }} /> View Supplier Profile
            </button>
            <button onClick={() => { setDone(false); setStep(1); setForm({ name: '', country: '', sector: '', description: '', supplier_type: '', access_type: '', criticality: '', contact_name: '', contact_email: '' }) }} className="btn-ghost" style={{ justifyContent: 'center' }}>
              + Onboard Another Supplier
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
   <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
        <button onClick={() => navigate('/suppliers')} className="btn-ghost" style={{ padding: '8px' }}>
          <ArrowLeft style={{ width: 16, height: 16 }} />
        </button>
        <div>
          <h1 className="page-title">Supplier Onboarding</h1>
          <div className="page-subtitle">// guided registration workflow — step {step} of {STEPS.length}</div>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator steps={STEPS} current={step} />

      {/* Step content */}
      <div className="card" style={{ minHeight: '320px' }}>

        {/* STEP 1 — Basic Info */}
        {step === 1 && (
          <div>
            <div className="section-title">Company Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Company Name *</label>
                <div style={{ position: 'relative' }}>
                  <Building style={{ width: 14, height: 14, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                  <input className="input" style={{ paddingLeft: '36px' }} placeholder="e.g. Siemens Energy Romania SRL"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Country *</label>
                <div style={{ position: 'relative' }}>
                  <Globe style={{ width: 14, height: 14, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                  <input className="input" style={{ paddingLeft: '36px' }} placeholder="Romania"
                    value={form.country} onChange={e => set('country', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Sector *</label>
                <select className="input" value={form.sector} onChange={e => set('sector', e.target.value)}>
                  <option value="">Select sector...</option>
                  {['Energy', 'Manufacturing', 'IT Services', 'Cloud Services', 'Industrial Automation', 'Network Security', 'Cybersecurity', 'Data Management', 'Utilities', 'Transport', 'Healthcare', 'Finance'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Description</label>
                <textarea className="input" placeholder="Brief description of services provided..." rows={3}
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Classification */}
        {step === 2 && (
          <div>
            <div className="section-title">Supplier Classification</div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Supplier Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { val: 'IT',     label: 'IT Supplier',     desc: 'Software, cloud, IT services', color: '#22d3ee' },
                  { val: 'OT',     label: 'OT Supplier',     desc: 'Industrial, SCADA, PLC, HMI',  color: '#a78bfa' },
                  { val: 'HYBRID', label: 'Hybrid Supplier', desc: 'Both IT and OT components',    color: '#39e75f' },
                ].map(opt => (
                  <button key={opt.val} onClick={() => set('supplier_type', opt.val)} style={{
                    padding: '16px 12px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                    background: form.supplier_type === opt.val ? `${opt.color}15` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${form.supplier_type === opt.val ? opt.color : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s',
                    boxShadow: form.supplier_type === opt.val ? `0 0 20px ${opt.color}20` : 'none',
                  }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', color: form.supplier_type === opt.val ? opt.color : 'rgba(220,235,255,0.6)', letterSpacing: '0.05em', marginBottom: '4px' }}>{opt.val}</div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: form.supplier_type === opt.val ? 'rgba(220,235,255,0.8)' : 'rgba(220,235,255,0.45)' }}>{opt.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(180,210,255,0.35)', marginTop: '4px' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Access Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { val: 'NONE',       label: 'No Access',        desc: 'No system access',      color: '#39e75f' },
                  { val: 'PHYSICAL',   label: 'Physical',         desc: 'On-site access only',   color: '#22d3ee' },
                  { val: 'REMOTE',     label: 'Remote',           desc: 'VPN/remote connection', color: '#ffd60a' },
                  { val: 'PRIVILEGED', label: 'Privileged',       desc: 'Admin/root access',     color: '#ff6b35' },
                ].map(opt => (
                  <button key={opt.val} onClick={() => set('access_type', opt.val)} style={{
                    padding: '14px 10px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                    background: form.access_type === opt.val ? `${opt.color}12` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${form.access_type === opt.val ? opt.color : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: form.access_type === opt.val ? opt.color : 'rgba(220,235,255,0.55)', letterSpacing: '0.05em', marginBottom: '2px' }}>{opt.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', color: 'rgba(180,210,255,0.35)' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Risk Profile */}
        {step === 3 && (
          <div>
            <div className="section-title">Criticality Assessment</div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Operational Criticality *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { val: 'LOW',      desc: 'Minimal impact if unavailable',          color: '#39e75f' },
                  { val: 'MEDIUM',   desc: 'Moderate operational impact',            color: '#ffd60a' },
                  { val: 'HIGH',     desc: 'Significant operational disruption',     color: '#ff6b35' },
                  { val: 'CRITICAL', desc: 'Essential — failure = major incident',   color: '#ff2d55' },
                ].map(opt => (
                  <button key={opt.val} onClick={() => set('criticality', opt.val)} style={{
                    padding: '16px 12px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                    background: form.criticality === opt.val ? `${opt.color}15` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${form.criticality === opt.val ? opt.color : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: form.criticality === opt.val ? opt.color : 'rgba(220,235,255,0.55)', letterSpacing: '0.08em', marginBottom: '4px' }}>{opt.val}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', color: 'rgba(180,210,255,0.35)', lineHeight: 1.4 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Risk preview */}
            {form.criticality && form.access_type && (
              <div style={{ padding: '16px', borderRadius: '12px', background: `${riskColor[estimatedRisk]}10`, border: `1px solid ${riskColor[estimatedRisk]}30` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertTriangle style={{ width: 18, height: 18, color: riskColor[estimatedRisk], flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: riskColor[estimatedRisk], marginBottom: '3px' }}>
                      ESTIMATED INITIAL RISK: {estimatedRisk}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(180,210,255,0.5)' }}>
                      Based on {form.access_type} access + {form.criticality} criticality — actual score calculated after assessment
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Contact */}
        {step === 4 && (
          <div>
            <div className="section-title">Contact Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Contact Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ width: 14, height: 14, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                  <input className="input" style={{ paddingLeft: '36px' }} placeholder="John Doe"
                    value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Contact Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ width: 14, height: 14, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                  <input className="input" style={{ paddingLeft: '36px' }} placeholder="contact@company.com"
                    value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '14px 16px', borderRadius: '10px', background: 'rgba(57,231,95,0.05)', border: '1px solid rgba(57,231,95,0.12)' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(180,210,255,0.42)' }}>
                Contact details are optional but recommended for follow-up on remediation actions and re-assessments.
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && (
          <div>
            <div className="section-title">Review & Confirm</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
              {[
                { label: 'Company Name',  value: form.name              },
                { label: 'Country',       value: form.country           },
                { label: 'Sector',        value: form.sector            },
                { label: 'Type',          value: form.supplier_type     },
                { label: 'Access Type',   value: form.access_type       },
                { label: 'Criticality',   value: form.criticality       },
                { label: 'Contact',       value: form.contact_name || '—' },
                { label: 'Email',         value: form.contact_email || '—' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(180,210,255,0.42)' }}>{item.label}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: 'rgba(220,235,255,0.8)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 16px', borderRadius: '10px', background: `${riskColor[estimatedRisk]}10`, border: `1px solid ${riskColor[estimatedRisk]}30`, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield style={{ width: 18, height: 18, color: riskColor[estimatedRisk], flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: riskColor[estimatedRisk] }}>
                  Estimated Initial Risk: {estimatedRisk}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(180,210,255,0.42)', marginTop: '2px' }}>
                  An assessment is recommended immediately after onboarding
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/suppliers')}
          className="btn-secondary">
          <ArrowLeft style={{ width: 14, height: 14 }} />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        <div style={{ display: 'flex', gap: '6px' }}>
          {STEPS.map(s => (
            <div key={s.id} style={{ width: step === s.id ? '20px' : '6px', height: '6px', borderRadius: '3px', background: step > s.id ? '#39e75f' : step === s.id ? '#39e75f' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
          ))}
        </div>

        {step < 5 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary"
            style={{ opacity: canNext() ? 1 : 0.4 }}>
            Next <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="btn-primary"
            style={{ padding: '0.6rem 1.5rem' }}>
            {loading
              ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Saving...</>
              : <><CheckCircle style={{ width: 14, height: 14 }} /> Complete Onboarding</>}
          </button>
        )}
      </div>
    </div>
  )
}