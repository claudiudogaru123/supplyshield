import { Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import type { DashboardStats } from '../../types'

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  const critical = (stats.risk_distribution?.CRITICAL || 0) + (stats.risk_distribution?.HIGH || 0)

  const cards = [
    {
      label: 'Total Suppliers',
      value: stats.total_suppliers,
      icon: Users,
      accent: '#06b6d4',
      bg: 'rgba(6,182,212,0.08)',
      border: 'rgba(6,182,212,0.2)',
      sub: 'registered entities',
    },
    {
      label: 'High / Critical',
      value: critical,
      icon: AlertTriangle,
      accent: '#ff2d55',
      bg: 'rgba(255,45,85,0.08)',
      border: 'rgba(255,45,85,0.2)',
      sub: 'require attention',
    },
    {
      label: 'Assessments',
      value: stats.completed_assessments,
      icon: CheckCircle,
      accent: '#00ff88',
      bg: 'rgba(0,255,136,0.06)',
      border: 'rgba(0,255,136,0.2)',
      sub: 'completed',
    },
    {
      label: 'Avg Risk Score',
      value: stats.average_risk_score.toFixed(1),
      icon: TrendingUp,
      accent: stats.average_risk_score >= 50 ? '#ff6b35' : '#ffd60a',
      bg: stats.average_risk_score >= 50 ? 'rgba(255,107,53,0.08)' : 'rgba(255,214,10,0.06)',
      border: stats.average_risk_score >= 50 ? 'rgba(255,107,53,0.2)' : 'rgba(255,214,10,0.2)',
      sub: 'portfolio average',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={card.label} className="stat-card animate-fade-in"
          style={{ animationDelay: `${i * 0.08}s`, background: card.bg, borderColor: card.border, '--accent-gradient': `linear-gradient(90deg, ${card.accent}, transparent)` } as any}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}>
              <card.icon className="w-4 h-4" style={{ color: card.accent }} />
            </div>
            <div className="w-1 h-8 rounded-full opacity-40" style={{ background: card.accent }} />
          </div>
          <div className="mono text-3xl font-bold mb-1" style={{ color: card.accent }}>
            {card.value}
          </div>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
            {card.label}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#334155', marginTop: '0.25rem' }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}