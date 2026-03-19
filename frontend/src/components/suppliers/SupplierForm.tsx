import { useState } from 'react'
import { suppliersApi } from '../../utils/api'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function SupplierForm({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', country: '', sector: '',
    supplier_type: 'IT', access_type: 'REMOTE', criticality: 'MEDIUM',
    contact_name: '', contact_email: '', description: ''
  })

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const submit = async () => {
    if (!form.name || !form.country || !form.sector) return alert('Fill required fields')
    setLoading(true)
    try {
      await suppliersApi.create(form)
      onSuccess()
    } catch { alert('Error creating supplier') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Add New Supplier</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Supplier Name *</label>
            <input name="name" value={form.name} onChange={handle} className="input" placeholder="Company name" />
          </div>
          <div>
            <label className="label">Country *</label>
            <input name="country" value={form.country} onChange={handle} className="input" placeholder="Romania" />
          </div>
          <div>
            <label className="label">Sector *</label>
            <input name="sector" value={form.sector} onChange={handle} className="input" placeholder="IT Services" />
          </div>
          <div>
            <label className="label">Supplier Type</label>
            <select name="supplier_type" value={form.supplier_type} onChange={handle} className="input">
              <option value="IT">IT</option>
              <option value="OT">OT</option>
              <option value="HYBRID">HYBRID</option>
            </select>
          </div>
          <div>
            <label className="label">Access Type</label>
            <select name="access_type" value={form.access_type} onChange={handle} className="input">
              <option value="NONE">None</option>
              <option value="REMOTE">Remote</option>
              <option value="PHYSICAL">Physical</option>
              <option value="PRIVILEGED">Privileged</option>
            </select>
          </div>
          <div>
            <label className="label">Criticality</label>
            <select name="criticality" value={form.criticality} onChange={handle} className="input">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="label">Contact Name</label>
            <input name="contact_name" value={form.contact_name} onChange={handle} className="input" placeholder="John Doe" />
          </div>
          <div>
            <label className="label">Contact Email</label>
            <input name="contact_email" value={form.contact_email} onChange={handle} className="input" placeholder="john@company.com" />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handle} className="input h-20 resize-none" placeholder="Brief description..." />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={submit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : 'Add Supplier'}
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}