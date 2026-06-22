import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import { calculatePremium } from '@/services/premiumService'
import type { Gender, RiskLevel, PremiumCalculationResponse, ApiErrorResponse } from '@/types/premium'

interface FormRefs {
  planId:    Ref<number>
  age:       Ref<number>
  gender:    Ref<Gender>
  riskLevel: Ref<RiskLevel>
}

/**
 * 負責呼叫試算 API 並管理結果狀態。
 * 接收表單 Ref，讓表單與試算邏輯各自獨立。
 */
export function usePremiumCalculation({ planId, age, gender, riskLevel }: FormRefs) {
  const isLoading    = ref(false)
  const result       = ref<PremiumCalculationResponse | null>(null)
  const errorMessage = ref('')
  const errorCode    = ref('')

  async function handleSubmit() {
    isLoading.value    = true
    errorMessage.value = ''
    errorCode.value    = ''
    result.value       = null

    try {
      result.value = await calculatePremium({
        planId:    planId.value,
        age:       age.value,
        gender:    gender.value,
        riskLevel: riskLevel.value,
      })
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response?.data) {
        errorMessage.value = err.response.data.message   || '試算失敗，請稍後再試。'
        errorCode.value    = err.response.data.errorCode || ''
      } else {
        errorMessage.value = '無法連線至伺服器，請確認後端服務是否啟動後再試一次。'
      }
    } finally {
      isLoading.value = false
    }
  }

  function dismissError() {
    errorMessage.value = ''
    errorCode.value    = ''
  }

  return { isLoading, result, errorMessage, errorCode, handleSubmit, dismissError }
}
