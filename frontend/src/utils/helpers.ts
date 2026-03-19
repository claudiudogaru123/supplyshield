export const getRiskColor = (category: string) => {
  switch (category) {
    case 'CRITICAL': return 'text-red-400'
    case 'HIGH': return 'text-orange-400'
    case 'MEDIUM': return 'text-yellow-400'
    case 'LOW': return 'text-green-400'
    default: return 'text-gray-400'
  }
}

export const getRiskBg = (category: string) => {
  switch (category) {
    case 'CRITICAL': return 'bg-red-900/30 border-red-700'
    case 'HIGH': return 'bg-orange-900/30 border-orange-700'
    case 'MEDIUM': return 'bg-yellow-900/30 border-yellow-700'
    case 'LOW': return 'bg-green-900/30 border-green-700'
    default: return 'bg-gray-800 border-gray-700'
  }
}

export const getRiskBadgeClass = (category: string) => {
  switch (category) {
    case 'CRITICAL': return 'badge-critical'
    case 'HIGH': return 'badge-high'
    case 'MEDIUM': return 'badge-medium'
    case 'LOW': return 'badge-low'
    default: return 'badge-low'
  }
}

export const getScoreColor = (score: number) => {
  if (score >= 75) return '#ef4444'
  if (score >= 50) return '#f97316'
  if (score >= 25) return '#f59e0b'
  return '#22c55e'
}

export const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('ro-RO', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}