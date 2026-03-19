import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { DashboardStats } from '../../types'

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#22c55e',
}
const TYPE_COLORS: Record<string, string> = {
  IT: '#3b82f6', OT: '#8b5cf6', HYBRID: '#06b6d4',
}

interface Props { stats: DashboardStats }

export default function RiskChart({ stats }: Props) {
  const riskData = Object.entries(stats.risk_distribution || {}).map(([key, value]) => ({
    name: key, value, color: RISK_COLORS[key] || '#6b7280'
  }))
  const typeData = Object.entries(stats.type_distribution || {}).map(([key, value]) => ({
    name: key, value, color: TYPE_COLORS[key] || '#6b7280'
  }))

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 className="text-gray-300 font-semibold mb-4">Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
              dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
              {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-gray-300 font-semibold mb-4">Suppliers by Type</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={typeData} barSize={40}>
            <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
            <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}