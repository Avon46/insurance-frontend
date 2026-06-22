<script setup lang="ts">
import { computed } from 'vue'
import type { PlanCategory, InsurancePlanOption, PremiumCalculationResponse } from '@/types/premium'

const categoryLabels: Record<PlanCategory, string> = {
  MEDICAL: '醫療險',
  ACCIDENT: '意外險',
  LIFE: '壽險',
}

const MAX_COEFFICIENT = 1.8
const GAUGE_RADIUS = 40
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS

const currencyFormatter = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
})

function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

const props = defineProps<{
  isLoading: boolean
  result: PremiumCalculationResponse | null
  errorMessage: string
  errorCode: string
  selectedPlan: InsurancePlanOption | undefined
  genderLabel: string
  riskLevelLabel: string
}>()

const emit = defineEmits<{
  'dismissError': []
}>()

const multiplier = computed(() =>
  props.result ? props.result.ageCoefficient * props.result.riskCoefficient : 0,
)
const multiplierLabel = computed(() => `${multiplier.value.toFixed(2)}×`)

const ageCoefPercent = computed(() =>
  props.result ? Math.min(100, Math.round((props.result.ageCoefficient / MAX_COEFFICIENT) * 100)) : 0,
)
const riskCoefPercent = computed(() =>
  props.result ? Math.min(100, Math.round((props.result.riskCoefficient / MAX_COEFFICIENT) * 100)) : 0,
)

const gaugePercent = computed(() => {
  if (!props.result) return 0
  const maxMultiplier = MAX_COEFFICIENT * MAX_COEFFICIENT
  const pct = ((multiplier.value - 1) / (maxMultiplier - 1)) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
})

const gaugeDashOffset = computed(() => GAUGE_CIRCUMFERENCE * (1 - gaugePercent.value / 100))

const insightText = computed(() => {
  if (!props.result || !props.selectedPlan) return ''
  const plan = props.selectedPlan
  const pctChange = Math.round((multiplier.value - 1) * 100)
  const direction = pctChange >= 0 ? '增加' : '減少'
  return `此方案核保年齡 ${plan.minAge}–${plan.maxAge} 歲。依您輸入的條件，保費較基本保費${direction} ${Math.abs(pctChange)}%，預估每年保費為 ${formatCurrency(props.result.estimatedPremium)}。`
})
</script>

<template>
  <div class="result-col">
    <div class="result-col__header">
      <h2 class="result-col__title">
        <svg class="result-col__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"
            stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        試算結果
      </h2>
      <p v-if="result" class="result-col__meta">
        試算依據：{{ result.age }} 歲・{{ genderLabel }}・{{ riskLevelLabel }}
      </p>
    </div>

    <div aria-live="polite">
      <!-- 載入中 -->
      <div v-if="isLoading" class="result-card result-card--loading">
        <q-spinner color="primary" size="30px" />
        <p class="result-card__placeholder-text">正在為您試算保費…</p>
      </div>

      <!-- 錯誤 -->
      <div v-else-if="errorMessage" class="result-card result-card--error">
        <svg class="result-card__error-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 6 L44 40 H4 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <line x1="24" y1="20" x2="24" y2="29" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <circle cx="24" cy="34" r="1.6" fill="currentColor" />
        </svg>
        <p class="result-card__error-text">{{ errorMessage }}</p>
        <p v-if="errorCode" class="result-card__error-code">錯誤代碼：{{ errorCode }}</p>
        <q-btn flat outline no-caps label="重新填寫" color="grey-7" @click="emit('dismissError')" />
      </div>

      <!-- 尚無結果 -->
      <div v-else-if="!result" class="result-card result-card--idle">
        <q-icon name="calculate" size="56px" color="blue-grey-3" />
        <div class="idle__title">尚未進行試算</div>
        <div class="idle__desc">填寫左側條件後，點擊「開始試算」<br>即可查看您的預估保費</div>
      </div>

      <!-- 成功 -->
      <Transition name="fade-up">
        <div v-if="!isLoading && result" class="result-card result-card--success">
          <div class="result-card__top">
            <span class="result-card__badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span v-if="selectedPlan" class="tag-pill">{{ categoryLabels[selectedPlan.category] }}</span>
          </div>

          <h3 class="result-card__name">{{ result.planName }}</h3>

          <ul class="checklist">
            <li v-if="selectedPlan">
              <svg class="checklist__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              最高保障 {{ formatCurrency(selectedPlan.maxCoverage) }}
            </li>
            <li v-if="selectedPlan">
              <svg class="checklist__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              承保年齡 {{ selectedPlan.minAge }}–{{ selectedPlan.maxAge }} 歲
            </li>
            <li>
              <svg class="checklist__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              目前狀態：開放投保
            </li>
          </ul>

          <div class="result-card__main-row">
            <div class="price-block">
              <span class="price-block__label">預估保費</span>
              <div class="price-block__value-row">
                <span class="price-block__value">{{ formatCurrency(result.estimatedPremium) }}</span>
                <span class="tag-pill tag-pill--muted">／年</span>
              </div>
            </div>

            <div class="gauge-block">
              <div class="gauge">
                <svg viewBox="0 0 100 100" class="gauge__ring">
                  <circle cx="50" cy="50" r="40" class="gauge__track" />
                  <circle cx="50" cy="50" r="40" class="gauge__progress"
                    :style="{ strokeDasharray: GAUGE_CIRCUMFERENCE, strokeDashoffset: gaugeDashOffset }" />
                </svg>
                <div class="gauge__center">
                  <span class="gauge__value">{{ multiplierLabel }}</span>
                </div>
              </div>
              <span class="gauge__caption">保費倍數</span>
            </div>
          </div>

          <div class="breakdown-bars">
            <div class="breakdown-bar">
              <div class="breakdown-bar__row">
                <span>基本保費</span><span>100%</span>
              </div>
              <q-linear-progress :value="1" color="primary" rounded size="6px" class="breakdown-progress" />
            </div>
            <div class="breakdown-bar">
              <div class="breakdown-bar__row">
                <span>年齡加成（係數 {{ result.ageCoefficient.toFixed(2) }}）</span>
                <span>{{ ageCoefPercent }}%</span>
              </div>
              <q-linear-progress :value="ageCoefPercent / 100" color="primary" rounded size="6px"
                class="breakdown-progress" />
            </div>
            <div class="breakdown-bar">
              <div class="breakdown-bar__row">
                <span>職業風險加成（係數 {{ result.riskCoefficient.toFixed(2) }}）</span>
                <span>{{ riskCoefPercent }}%</span>
              </div>
              <q-linear-progress :value="riskCoefPercent / 100" color="primary" rounded size="6px"
                class="breakdown-progress" />
            </div>
          </div>

          <p class="insight-strip">
            <svg class="insight-strip__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11c.6.4 1 1 1 1.7V17h4v-1.3c0-.7.4-1.3 1-1.7a6 6 0 0 0-3-11Z"
                stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            </svg>
            {{ insightText }}
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.result-col__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.result-col__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--dark-green);
}

.result-col__icon {
  width: 18px;
  height: 18px;
  color: var(--primary-color);
}

.result-col__meta {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
}

.result-card {
  background: var(--white);
  border: 2px solid var(--light-green);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 28px;
}

.result-card--idle,
.result-card--loading,
.result-card--error {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  min-height: 320px;
  justify-content: center;
}

.result-card--error {
  border-color: var(--error-bg);
}

.result-card__placeholder-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  max-width: 260px;
}

.idle__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.idle__desc {
  font-size: 13.5px;
  color: var(--text-muted);
  line-height: 1.7;
  text-align: center;
  margin: 0;
}

.result-card__error-icon {
  width: 38px;
  height: 38px;
  color: var(--error-color);
}

.result-card__error-text {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--error-color);
  max-width: 280px;
}

.result-card__error-code {
  margin: -4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.result-card--success {
  border-color: var(--primary-color);
}

.result-card__top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.result-card__badge {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--dark-green);
  color: var(--white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-card__badge svg {
  width: 16px;
  height: 16px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  background: #f1f1f1;
  color: var(--text-main);
  font-size: 12px;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 999px;
}

.tag-pill--muted {
  background: var(--light-green);
  color: var(--dark-green);
}

.result-card__name {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 800;
  color: var(--dark-green);
}

.checklist {
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.checklist li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--text-main);
}

.checklist__icon {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.result-card__main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  border-top: 1px solid var(--border-grey);
  border-bottom: 1px solid var(--border-grey);
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.price-block__label {
  display: block;
  font-size: 12.5px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.price-block__value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-block__value {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary-color);
}

.gauge-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.gauge {
  position: relative;
  width: 88px;
  height: 88px;
}

.gauge__ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge__track {
  fill: none;
  stroke: var(--light-green);
  stroke-width: 8;
}

.gauge__progress {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}

.gauge__center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge__value {
  font-size: 16px;
  font-weight: 800;
  color: var(--dark-green);
}

.gauge__caption {
  font-size: 11px;
  color: var(--text-muted);
}

.breakdown-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.breakdown-bar__row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 5px;
}

.breakdown-progress {
  border-radius: 999px;
}

:deep(.breakdown-progress .q-linear-progress__track) {
  background: var(--light-green);
  opacity: 1;
}

.insight-strip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 14px 16px;
  background: var(--light-green);
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.6;
  color: var(--dark-green);
}

.insight-strip__icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--primary-color);
}

.fade-up-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
</style>
