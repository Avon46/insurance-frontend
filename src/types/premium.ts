export type Gender = 'M' | 'F'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type PlanCategory = 'MEDICAL' | 'ACCIDENT' | 'LIFE'

export interface InsurancePlanOption {
  id: number
  name: string
  category: PlanCategory
  base_premium: number
  max_coverage: number
  min_age: number
  max_age: number
}

export interface PremiumCalculationRequest {
  plan_id: number
  age: number
  gender: Gender
  risk_level: RiskLevel
}

export interface PremiumCalculationResponse {
  plan_id: number
  plan_name: string
  base_premium: number
  age: number
  age_coefficient: number
  risk_level: RiskLevel
  risk_coefficient: number
  estimated_premium: number
}

export interface ApiErrorResponse {
  success: false
  message: string
  error_code: string
  timestamp: string
}
