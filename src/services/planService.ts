import apiClient from './api'
import type { InsurancePlan, PlanCategory, PlanRequest } from '@/types/plan'

// ─────────────────────────────────────────────────────────
// 後台保單管理 CRUD - API 呼叫
// 對應後端 com.insurance.insurance_backend.controller.InsurancePlanController
// 前後端皆以 JSON 封裝資料。
// ─────────────────────────────────────────────────────────

/** GET /plans —— 取得保單列表，category 選填（後端依分類篩選） */
export async function fetchPlans(category?: PlanCategory): Promise<InsurancePlan[]> {
  const { data } = await apiClient.get<InsurancePlan[]>('/plans', {
    params: category ? { category } : undefined,
  })
  return data
}

/** GET /plans/{id} —— 取得單筆保單（供修改視窗預填） */
export async function fetchPlan(id: number): Promise<InsurancePlan> {
  const { data } = await apiClient.get<InsurancePlan>(`/plans/${id}`)
  return data
}

/** POST /plans —— 新增保單方案 */
export async function createPlan(payload: PlanRequest): Promise<InsurancePlan> {
  const { data } = await apiClient.post<InsurancePlan>('/plans', payload)
  return data
}

/** PUT /plans/{id} —— 修改特定保單資料 */
export async function updatePlan(id: number, payload: PlanRequest): Promise<InsurancePlan> {
  const { data } = await apiClient.put<InsurancePlan>(`/plans/${id}`, payload)
  return data
}

/** DELETE /plans/{id} —— 刪除特定保單 */
export async function deletePlan(id: number): Promise<void> {
  await apiClient.delete(`/plans/${id}`)
}
