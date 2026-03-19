import { useQuery } from '@tanstack/react-query'
import { assessmentsApi, recommendationsApi } from '../../utils/api'
import type { Supplier } from '../../types'
import { getRiskBadgeClass, getScoreColor, formatDate } from '../../utils/helpers'
import { ArrowLeft, ClipboardList, AlertTriangle, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  supplier: Supplier
  onBack: () => void
}

export default function SupplierDetail({ supplier, onBack }: Props) {
  const navigate = useNavigate()

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments', supplier.id],
    queryFn: () => assessmentsApi.list(supplier.id),
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', supplier.id],
    queryFn: () => recommendationsApi.get(supplier.id),
    enabled: supplier.assessment_count > 0,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{supplier.name}</h1>
          <p className="text-gray-400 text-sm">{supplier.sector} · {supplier.country}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className={getRiskBadgeClass(supplier.risk_category)}>{supplier.risk_category}</span>
          <button onClick={() => navigate(`/assessment/${supplier.id}`)} className="btn-primary flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Start Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-gray-500 text-xs mb-1">Risk Score</p>
          <div className="text-3xl font-bold" style={{ color: getScoreColor(supplier.risk_score) }}>
            {supplier.risk_score?.toFixed(1) || '0.0'}
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div className="h-2 rounded-full" style={{
              width: `${supplier.risk_score}%`,
              backgroundColor: getScoreColor(supplier.risk_score)
            }} />
          </div>
        </div>
        <div className="card">
          <p className="text-gray-500 text-xs mb-1">Inherent Risk</p>
          <div className="text-3xl font-bold text-orange-400">{supplier.inherent_risk?.toFixed(1) || '0.0'}</div>
        </div>
        <div className="card">
          <p className="text-gray-500 text-xs mb-1">Residual Risk</p>
          <div className="text-3xl font-bold text-yellow-400">{supplier.residual_risk?.toFixed(1) || '0.0'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-gray-300 font-semibold mb-3">Supplier Details</h3>
          <dl className="space-y-2 text-sm">
            {[
              ['Type', supplier.supplier_type],
              ['Access Type', supplier.access_type],
              ['Criticality', supplier.criticality],
              ['Contact', supplier.contact_name || '—'],
              ['Email', supplier.contact_email || '—'],
              ['Assessments', supplier.assessment_count],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-gray-200 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card">
          <h3 className="text-gray-300 font-semibold mb-3">Assessment History</h3>
          {assessments.length === 0 ? (
            <p className="text-gray-500 text-sm">No assessments yet.</p>
          ) : (
            <div className="space-y-2">
              {assessments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    {a.status === 'COMPLETED'
                      ? <CheckCircle className="w-4 h-4 text-green-400" />
                      : <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                    <span className="text-gray-300 text-sm">{formatDate(a.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">{a.completion_percentage?.toFixed(0)}%</span>
                    {a.score > 0 && (
                      <span className="font-mono text-sm" style={{ color: getScoreColor(a.score) }}>
                        {a.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {recommendations && recommendations.technical_actions?.length > 0 && (
        <div className="card">
          <h3 className="text-gray-300 font-semibold mb-4">
            Top Recommendations
            <span className="ml-2 text-xs text-red-400">
              {recommendations.summary.critical_actions} critical
            </span>
          </h3>
          <div className="space-y-2">
            {recommendations.technical_actions.slice(0, 5).map((action: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                action.priority === 'CRITICAL' ? 'bg-red-900/20 border-red-800' :
                action.priority === 'HIGH' ? 'bg-orange-900/20 border-orange-800' :
                'bg-gray-800 border-gray-700'
              }`}>
                <span className={getRiskBadgeClass(action.priority)}>{action.priority}</span>
                <div className="flex-1">
                  <p className="text-gray-200 text-sm">{action.action}</p>
                  <p className="text-gray-500 text-xs mt-1">{action.domain} · {action.timeline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}