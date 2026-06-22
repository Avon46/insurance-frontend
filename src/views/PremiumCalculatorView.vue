<script setup lang="ts">
import { onMounted } from 'vue'
import { usePremiumPlans }       from '@/composables/PremiumCalculator/usePremiumPlans'
import { usePremiumForm }        from '@/composables/PremiumCalculator/usePremiumForm'
import { usePremiumCalculation } from '@/composables/PremiumCalculator/usePremiumCalculation'
import PremiumCalculatorForm     from '@/components/PremiumCalculator/PremiumCalculatorForm.vue'
import PremiumCalculatorResult   from '@/components/PremiumCalculator/PremiumCalculatorResult.vue'

const { plans, isLoadingPlans, loadPlans } = usePremiumPlans()

const {
  planId, age, gender, riskLevel,
  selectedPlan, genderLabel, riskLevelLabel,
  initFromFirstPlan,
} = usePremiumForm(plans)

const {
  isLoading, result, errorMessage, errorCode,
  handleSubmit, dismissError,
} = usePremiumCalculation({ planId, age, gender, riskLevel })

onMounted(async () => {
  const { firstPlan, error } = await loadPlans()
  if (error)      errorMessage.value = error
  else if (firstPlan) initFromFirstPlan(firstPlan)
})
</script>

<template>
  <q-page>
    <div class="page">
      <div class="layout">

        <PremiumCalculatorForm
          :plans="plans"
          :is-loading-plans="isLoadingPlans"
          :plan-id="planId"
          :age="age"
          :gender="gender"
          :risk-level="riskLevel"
          :selected-plan="selectedPlan"
          :is-loading="isLoading"
          @update:plan-id="planId = $event"
          @update:age="age = $event"
          @update:gender="gender = $event"
          @update:risk-level="riskLevel = $event"
          @submit="handleSubmit"
        />

        <PremiumCalculatorResult
          :is-loading="isLoading"
          :result="result"
          :error-message="errorMessage"
          :error-code="errorCode"
          :selected-plan="selectedPlan"
          :gender-label="genderLabel"
          :risk-level-label="riskLevelLabel"
          @dismiss-error="dismissError"
        />

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
