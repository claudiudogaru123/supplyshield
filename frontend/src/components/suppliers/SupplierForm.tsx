import { useState } from 'react'
import { suppliersApi } from '../../utils/api'
import { X, Building, Globe, Cpu, Lock, Shield, User, Mail, FileText, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function SupplierForm({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', country: '', sector: '',
    supplier_type: 'IT', access_type: 'REMOTE', criticality: 'MEDIUM',
    contact_name: '', contact_email: '', description: '',
  })

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async () => {
    if (!form.name || !form.country || !form.sector) {
      alert('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      await suppliersApi.create(form)
      onSuccess()
    } catch { alert('Error creating supplier') }
    finally { setLoading(false) }
  }

  const TYPE_COLORS: Record<string, string> = { IT: '#0A84FF', OT: '#BF5AF2', HYBRID: '#25A244' }
  const CRIT_COLORS: Record<string, string> = { LOW: '#25A244', MEDIUM: '#CC8800', HIGH: '#FF9F0A', CRITICAL: '#FF453A' }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(10,132,255,0.10)', border: '1px solid rgba(10,132,255,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building style={{ width: 16, height: 16, color: 'var(--blue)' }} />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Add New Supplier
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Register a supplier in the risk management system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--surface-hover)'; el.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--surface)'; el.style.color = 'var(--text-muted)' }}
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Name — full width */}
          <div>
            <label className="label">Supplier Name *</label>
            <div style={{ position: 'relative' }}>
              <Building style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
              <input name="name" value={form.name} onChange={handle} className="input"
                placeholder="e.g. Siemens Energy Romania SRL" style={{ paddingLeft: 36 }} />
            </div>
          </div>

          {/* Country + Sector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="label">Country *</label>
              <div style={{ position: 'relative' }}>
                <Globe style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
                <input name="country" value={form.country} onChange={handle} className="input"
                  placeholder="Romania" style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div>
              <label className="label">Sector *</label>
              <select name="sector" value={form.sector} onChange={handle} className="input">
                <option value="">Select sector…</option>
                {['Energy','Manufacturing','IT Services','Cloud Services','Industrial Automation',
                  'Network Security','Cybersecurity','Data Management','Utilities','Transport','Healthcare','Finance'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Type + Access + Criticality */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="label">Supplier Type</label>
              <select name="supplier_type" value={form.supplier_type} onChange={handle} className="input"
                style={{ color: TYPE_COLORS[form.supplier_type], fontWeight: 600 }}>
                <option value="IT">IT</option>
                <option value="OT">OT</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="label">Access Type</label>
              <select name="access_type" value={form.access_type} onChange={handle} className="input">
                <option value="NONE">No Access</option>
                <option value="PHYSICAL">Physical</option>
                <option value="REMOTE">Remote</option>
                <option value="PRIVILEGED">Privileged</option>
              </select>
            </div>
            <div>
              <label className="label">Criticality</label>
              <select name="criticality" value={form.criticality} onChange={handle} className="input"
                style={{ color: CRIT_COLORS[form.criticality], fontWeight: 600 }}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="label">Contact Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
                <input name="contact_name" value={form.contact_name} onChange={handle} className="input"
                  placeholder="John Doe" style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div>
              <label className="label">Contact Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
                <input name="contact_email" value={form.contact_email} onChange={handle} className="input"
                  placeholder="john@company.com" style={{ paddingLeft: 36 }} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <div style={{ position: 'relative' }}>
              <FileText style={{ width: 14, height: 14, position: 'absolute', left: 12, top: 14, color: 'var(--text-ghost)', pointerEvents: 'none' }} />
              <textarea name="description" value={form.description} onChange={handle} className="input"
                placeholder="Brief description of services provided…"
                style={{ paddingLeft: 36, minHeight: 72, resize: 'vertical' }} />
            </div>
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={submit} disabled={loading} className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', height: 44, fontSize: '0.9rem' }}>
              {loading
                ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 0.85s linear infinite' }} /> Saving…</>
                : <><CheckCircle style={{ width: 15, height: 15 }} /> Add Supplier</>
              }
            </button>
            <button onClick={onClose} className="btn-secondary" style={{ minWidth: 90, justifyContent: 'center' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}