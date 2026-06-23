import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { RiskLevel, InsurancePlanOption } from '@/types/premium'

const riskLevelOptions = [
  { value: 'LOW'    as RiskLevel, shortLabel: '低風險' },
  { value: 'MEDIUM' as RiskLevel, shortLabel: '中風險' },
  { value: 'HIGH'   as RiskLevel, shortLabel: '高風險' },
]

/**
 * 管理試算表單的所有狀態：
 * - planId / age / riskLevel
 * - selectedPlan / riskLevelLabel（derived）
 * - 切換方案時自動夾年齡在承保範圍
 * - initFromFirstPlan()：載入完成後設預設值
 *
 * @param plans 由 usePremiumPlans 回傳的 Ref，用於查找選中方案
 */
export function usePremiumForm(plans: Ref<InsurancePlanOption[]>) {
  const planId    = ref<number>(0)
  const age       = ref<number>(30)
  const riskLevel = ref<RiskLevel>('LOW')

  const selectedPlan = computed(() =>
    plans.value.find((p) => p.id === planId.value),
  )

  const riskLevelLabel = computed(
    () => riskLevelOptions.find((o) => o.value === riskLevel.value)?.shortLabel ?? '',
  )

  // 切換方案時，把年齡夾在新方案的承保範圍內
  watch(planId, (newId) => {
    const plan = plans.value.find((p) => p.id === newId)
    if (!plan) return
    if (age.value < plan.minAge) age.value = plan.minAge
    if (age.value > plan.maxAge) age.value = plan.maxAge
  })

  /** 載入方案清單後，用第一筆設定初始值 */
  function initFromFirstPlan(first: InsurancePlanOption) {
    planId.value = first.id
    age.value    = Math.round((first.minAge + first.maxAge) / 2)
  }

  return {
    planId,
    age,
    riskLevel,
    selectedPlan,
    riskLevelLabel,
    initFromFirstPlan,
  }
}
