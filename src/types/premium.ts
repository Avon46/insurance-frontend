export type Gender       = 'M' | 'F'
export type RiskLevel    = 'LOW' | 'MEDIUM' | 'HIGH'
export type PlanCategory = 'MEDICAL' | 'ACCIDENT' | 'LIFE'

export interface InsurancePlanOption {
  id:          number
  name:        string
  category:    PlanCategory
  basePremium: number
  maxCoverage: number
  minAge:      number
  maxAge:      number
}

export interface PremiumCalculationRequest {
  planId:    number
  age:       number
  gender:    Gender
  riskLevel: RiskLevel
}

export interface PremiumCalculationResponse {
  planId:           number
  planName:         string
  basePremium:      number
  age:              number
  ageCoefficient:   number
  riskLevel:        RiskLevel
  riskCoefficient:  number
  estimatedPremium: number
}

export interface ApiErrorResponse {
  success:   false
  message:   string
  errorCode: string
  timestamp: string
}
