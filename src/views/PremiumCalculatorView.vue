<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePremiumPlans } from '@/composables/PremiumCalculator/usePlans'
import { usePremiumForm } from '@/composables/PremiumCalculator/useForm'
import { usePremiumCalculation } from '@/composables/PremiumCalculator/useCalculation'
import PremiumCalculatorForm from '@/components/PremiumCalculator/Form.vue'
import PremiumCalculatorResult from '@/components/PremiumCalculator/Result.vue'

const route = useRoute()
const { plans, isLoadingPlans, loadPlans } = usePremiumPlans()

const {
  planId, age, riskLevel,
  selectedPlan, riskLevelLabel,
  initFromFirstPlan,
} = usePremiumForm(plans)

const {
  isLoading, result, errorMessage, errorCode,
  handleSubmit, dismissError,
} = usePremiumCalculation({ planId, age, riskLevel })

onMounted(async () => {
  const { firstPlan, error } = await loadPlans()
  if (error) {
    errorMessage.value = error
    return
  }
  if (firstPlan) initFromFirstPlan(firstPlan)

  // 從推薦頁跳轉時，以 query params 覆蓋預設值
  const qPlanId = Number(route.query.planId)
  const qAge = Number(route.query.age)
  if (qPlanId && plans.value.some((p) => p.id === qPlanId)) planId.value = qPlanId
  if (qAge > 0) age.value = qAge
})
</script>

<template>
  <q-page>
    <div class="page">
      <div class="layout">

        <PremiumCalculatorForm :plans="plans" :is-loading-plans="isLoadingPlans" :plan-id="planId" :age="age"
          :risk-level="riskLevel" :selected-plan="selectedPlan" :is-loading="isLoading"
          @update:plan-id="planId = $event" @update:age="age = $event" @update:risk-level="riskLevel = $event"
          @submit="handleSubmit" />

        <PremiumCalculatorResult :is-loading="isLoading" :result="result" :error-message="errorMessage"
          :error-code="errorCode" :selected-plan="selectedPlan" :risk-level-label="riskLevelLabel"
          @dismiss-error="dismissError" />

      </div>
    </div>
  </q-page>
</template>

<style scoped>
.page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 24px 64px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 24px;
  align-items: start;
}

@media (max-width: 760px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
