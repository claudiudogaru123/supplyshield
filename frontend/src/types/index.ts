export interface Supplier {
  id: string
  name: string
  country: string
  sector: string
  supplier_type: 'IT' | 'OT' | 'HYBRID'
  access_type: 'REMOTE' | 'PHYSICAL' | 'PRIVILEGED' | 'NONE'
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  contact_name?: string
  contact_email?: string
  description?: string
  risk_score: number
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  inherent_risk: number
  residual_risk: number
  assessment_count: number
  created_at: string
  updated_at: string
}

export interface Assessment {
  id: string
  supplier_id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  questions: Question[]
  answers: Record<string, number>
  score: number
  completion_percentage: number
  created_at: string
  completed_at?: string
}

export interface Question {
  id: string
  domain: string
  weight: number
  max_score: number
  text: string
  options: { value: number; label: string }[]
}

export interface ScoreData {
  inherent_risk: number
  control_maturity: number
  exposure: number
  criticality_factor: number
  residual_risk: number
  final_score: number
  risk_category: string
  breakdown: {
    inherent_risk_contribution: number
    residual_contribution: number
    exposure_contribution: number
  }
}

export interface DashboardStats {
  total_suppliers: number
  completed_assessments: number
  average_risk_score: number
  risk_distribution: Record<string, number>
  type_distribution: Record<string, number>
  top_risk_suppliers: Supplier[]
}

export interface Recommendation {
  technical_actions: TechnicalAction[]
  contractual_requirements: string[]
  reevaluation_timeline: string
  summary: {
    total_actions: number
    critical_actions: number
    high_actions: number
    medium_actions: number
    low_actions: number
  }
}

export interface TechnicalAction {
  question_id: string
  domain: string
  question: string
  current_score: number
  max_score: number
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  action: string
  timeline: string
}