import { ref } from 'vue'
import { getPlans } from '@/services/premiumService'
import type { InsurancePlanOption } from '@/types/premium'

/**
 * 負責從 API 載入保單清單。
 * 回傳 loadPlans()，讓呼叫端（View）決定何時觸發，
 * 並透過回傳值拿到第一筆方案或錯誤訊息。
 */
export function usePremiumPlans() {
  const plans          = ref<InsurancePlanOption[]>([])
  const isLoadingPlans = ref(true)

  async function loadPlans(): Promise<{ firstPlan?: InsurancePlanOption; error?: string }> {
    try {
      plans.value = await getPlans()
      return { firstPlan: plans.value[0] }
    } catch {
      return { error: '無法載入保單清單，請確認後端服務是否啟動後再試一次。' }
    } finally {
      isLoadingPlans.value = false
    }
  }

  return { plans, isLoadingPlans, loadPlans }
}
