export const getRiskColor = (category: string) => {
  switch (category) {
    case 'CRITICAL': return '#FF453A'
    case 'HIGH':     return '#FF9F0A'
    case 'MEDIUM':   return '#CC8800'
    case 'LOW':      return '#25A244'
    default:         return 'var(--text-muted)'
  }
}

export const getRiskBg = (category: string) => {
  switch (category) {
    case 'CRITICAL': return 'rgba(255,69,58,0.09)'
    case 'HIGH':     return 'rgba(255,159,10,0.09)'
    case 'MEDIUM':   return 'rgba(255,214,10,0.09)'
    case 'LOW':      return 'rgba(48,209,88,0.09)'
    default:         return 'var(--surface)'
  }
}

export const getRiskBadgeClass = (category: string) => {
  switch (category) {
    case 'CRITICAL': return 'badge-critical'
    case 'HIGH':     return 'badge-high'
    case 'MEDIUM':   return 'badge-medium'
    case 'LOW':      return 'badge-low'
    default:         return 'badge-low'
  }
}

export const getScoreColor = (score: number) => {
  if (score >= 75) return '#FF453A'
  if (score >= 50) return '#FF9F0A'
  if (score >= 25) return '#CC8800'
  return '#25A244'
}

export const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('ro-RO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}