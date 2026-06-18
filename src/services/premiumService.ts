import apiClient from './api'
import type { InsurancePlanOption, PremiumCalculationRequest, PremiumCalculationResponse } from '@/types/premium'

export async function getPlans(): Promise<InsurancePlanOption[]> {
  const { data } = await apiClient.get<InsurancePlanOption[]>('/plans')
  return data
}

export async function calculatePremium(
  payload: PremiumCalculationRequest,
): Promise<PremiumCalculationResponse> {
  const { data } = await apiClient.post<PremiumCalculationResponse>('/calculate-premium', payload)
  return data
}
