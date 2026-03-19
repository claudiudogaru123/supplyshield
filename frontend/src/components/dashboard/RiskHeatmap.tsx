import { useNavigate } from 'react-router-dom'
import type { Supplier } from '../../types'
import { getRiskBadgeClass, getScoreColor } from '../../utils/helpers'

export default function RiskHeatmap({ suppliers }: { suppliers: Supplier[] }) {
  const navigate = useNavigate()

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="section-title" style={{ marginBottom: 0 }}>Supplier Risk Matrix</div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#334155' }}>
          {suppliers.length} ENTITIES
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {['Supplier', 'Type', 'Sector', 'Access', 'Inherent', 'Score', 'Category'].map(h => (
                <th key={h} className="table-header text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={s.id} className="table-row cursor-pointer"
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => navigate('/suppliers')}>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 rounded-full flex-shrink-0"
                      style={{ background: getScoreColor(s.risk_score) }} />
                    <div>
                      <div style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155', fontSize: '0.6rem' }}>
                        {s.country}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span style={{
                    fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', fontWeight: 700,
                    letterSpacing: '0.08em', padding: '2px 8px', borderRadius: '4px',
                    background: s.supplier_type === 'IT' ? 'rgba(6,182,212,0.12)' : s.supplier_type === 'OT' ? 'rgba(139,92,246,0.12)' : 'rgba(0,255,136,0.08)',
                    color: s.supplier_type === 'IT' ? '#22d3ee' : s.supplier_type === 'OT' ? '#a78bfa' : '#00ff88',
                    border: `1px solid ${s.supplier_type === 'IT' ? 'rgba(6,182,212,0.25)' : s.supplier_type === 'OT' ? 'rgba(139,92,246,0.25)' : 'rgba(0,255,136,0.2)'}`,
                  }}>
                    {s.supplier_type}
                  </span>
                </td>
                <td className="py-3 pr-4" style={{ color: '#64748b', fontSize: '0.8rem' }}>{s.sector}</td>
                <td className="py-3 pr-4" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569', fontSize: '0.7rem' }}>
                  {s.access_type}
                </td>
                <td className="py-3 pr-4">
                  <span className="mono text-sm" style={{ color: '#94a3b8' }}>
                    {s.inherent_risk?.toFixed(0) || '—'}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 rounded-full h-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-1 rounded-full transition-all"
                        style={{ width: `${Math.min(s.risk_score || 0, 100)}%`, background: getScoreColor(s.risk_score || 0) }} />
                    </div>
                    <span className="mono text-xs font-bold" style={{ color: getScoreColor(s.risk_score || 0) }}>
                      {(s.risk_score || 0).toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}