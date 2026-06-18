<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { getPlans, calculatePremium } from '@/services/premiumService'
import type { Gender, RiskLevel, PlanCategory, InsurancePlanOption, PremiumCalculationResponse, ApiErrorResponse } from '@/types/premium'

const planCategories = ['MEDICAL', 'ACCIDENT', 'LIFE'] as const

const categoryLabels: Record<PlanCategory, string> = {
  MEDICAL: '醫療險',
  ACCIDENT: '意外險',
  LIFE: '壽險',
}

const riskLevelOptions: { value: RiskLevel; shortLabel: string; caption: string }[] = [
  { value: 'LOW', shortLabel: '低風險', caption: '內勤・辦公室工作' },
  { value: 'MEDIUM', shortLabel: '中風險', caption: '外勤・駕駛或拜訪客戶' },
  { value: 'HIGH', shortLabel: '高風險', caption: '外送・工地等高頻外出' },
]

const MAX_COEFFICIENT = 1.8
const GAUGE_RADIUS = 40
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS

const plans = ref<InsurancePlanOption[]>([])
const isLoadingPlans = ref(true)

const planId = ref<number>(0)
const age = ref<number>(30)
const gender = ref<Gender>('M')
const riskLevel = ref<RiskLevel>('LOW')

const isLoading = ref(false)
const result = ref<PremiumCalculationResponse | null>(null)
const errorMessage = ref('')
const errorCode = ref('')

const selectedPlan = computed(() => plans.value.find((plan) => plan.id === planId.value))

const genderLabel = computed(() => (gender.value === 'M' ? '男' : '女'))
const riskLevelLabel = computed(
  () => riskLevelOptions.find((option) => option.value === riskLevel.value)?.shortLabel ?? '',
)

watch(planId, (newId) => {
  const plan = plans.value.find((p) => p.id === newId)
  if (!plan) return
  if (age.value < plan.min_age) age.value = plan.min_age
  if (age.value > plan.max_age) age.value = plan.max_age
})

const currencyFormatter = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
})

function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

const multiplier = computed(() =>
  result.value ? result.value.age_coefficient * result.value.risk_coefficient : 0,
)
const multiplierLabel = computed(() => `${multiplier.value.toFixed(2)}×`)

const ageCoefPercent = computed(() =>
  result.value ? Math.min(100, Math.round((result.value.age_coefficient / MAX_COEFFICIENT) * 100)) : 0,
)
const riskCoefPercent = computed(() =>
  result.value ? Math.min(100, Math.round((result.value.risk_coefficient / MAX_COEFFICIENT) * 100)) : 0,
)

const gaugePercent = computed(() => {
  if (!result.value) return 0
  const maxMultiplier = MAX_COEFFICIENT * MAX_COEFFICIENT
  const pct = ((multiplier.value - 1) / (maxMultiplier - 1)) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
})

const gaugeDashOffset = computed(() => GAUGE_CIRCUMFERENCE * (1 - gaugePercent.value / 100))

const insightText = computed(() => {
  if (!result.value || !selectedPlan.value) return ''
  const plan = selectedPlan.value
  const pctChange = Math.round((multiplier.value - 1) * 100)
  const direction = pctChange >= 0 ? '增加' : '減少'
  return `此方案核保年齡 ${plan.min_age}–${plan.max_age} 歲。依您輸入的條件，保費較基本保費${direction} ${Math.abs(pctChange)}%，預估每年保費為 ${formatCurrency(result.value.estimated_premium)}。`
})

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = ''
  errorCode.value = ''
  result.value = null

  try {
    const data = await calculatePremium({
      plan_id: planId.value,
      age: age.value,
      gender: gender.value,
      risk_level: riskLevel.value,
    })
    result.value = data
  } catch (err) {
    if (axios.isAxiosError<ApiErrorResponse>(err) && err.response?.data) {
      errorMessage.value = err.response.data.message || '試算失敗，請稍後再試。'
      errorCode.value = err.response.data.error_code || ''
    } else {
      errorMessage.value = '無法連線至伺服器，請確認後端服務是否啟動後再試一次。'
    }
  } finally {
    isLoading.value = false
  }
}

function dismissError() {
  errorMessage.value = ''
  errorCode.value = ''
}

onMounted(async () => {
  try {
    plans.value = await getPlans()
    const defaultPlan = plans.value[0]
    if (defaultPlan) {
      planId.value = defaultPlan.id
      age.value = Math.round((defaultPlan.min_age + defaultPlan.max_age) / 2)
    }
    await handleSubmit()
  } catch {
    errorMessage.value = '無法載入保單清單，請確認後端服務是否啟動後再試一次。'
  } finally {
    isLoadingPlans.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="layout">
      <!-- 左側：輸入卡 -->
      <div class="input-card">
        <div class="input-card__hero">
          <p class="hero__eyebrow">保費試算系統</p>
          <h1 class="hero__title">幾個問題，看見您的預估保費</h1>
          <p class="hero__desc">輸入年齡、性別與職業風險，立即試算對應方案的保費，協助您評估個人的經濟負擔。</p>
        </div>

        <q-form class="input-card__body" novalidate @submit.prevent="handleSubmit">
          <!-- 投保方案 -->
          <section class="field-group">
            <h2 class="field-group__label">
              <svg class="field-group__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.6" />
                <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
              投保方案
            </h2>
            <!-- 原生 select 保留分類群組 optgroup -->
            <select id="plan" v-model.number="planId" class="select-control" :disabled="isLoadingPlans">
              <optgroup v-for="category in planCategories" :key="category" :label="categoryLabels[category]">
                <option v-for="plan in plans.filter((p) => p.category === category)" :key="plan.id" :value="plan.id">
                  {{ plan.name }}
                </option>
              </optgroup>
            </select>
          </section>

          <!-- 年齡滑桿 -->
          <section class="field-group">
            <div class="slider-callout">
              <span class="field-group__label field-group__label--inline">
                <svg class="field-group__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.6" />
                  <line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" stroke-width="1.6" />
                  <line x1="8" y1="3" x2="8" y2="6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  <line x1="16" y1="3" x2="16" y2="6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                </svg>
                年齡
              </span>
              <span class="slider-callout__value">{{ age }}<span class="slider-callout__unit">歲</span></span>
            </div>
            <q-slider
              v-model="age"
              :min="selectedPlan?.min_age ?? 0"
              :max="selectedPlan?.max_age ?? 100"
              :step="1"
              color="primary"
              class="age-slider"
            />
            <div class="slider__bounds">
              <span>{{ selectedPlan?.min_age ?? 0 }} 歲</span>
              <span>{{ selectedPlan?.max_age ?? 100 }} 歲</span>
            </div>
          </section>

          <!-- 性別 -->
          <section class="field-group">
            <h2 class="field-group__label">
              <svg class="field-group__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.6" />
                <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
              性別
            </h2>
            <q-btn-toggle
              v-model="gender"
              spread
              no-caps
              unelevated
              outline
              toggle-color="primary"
              color="white"
              text-color="grey-9"
              toggle-text-color="white"
              :options="[
                { label: '男', value: 'M' },
                { label: '女', value: 'F' },
              ]"
              class="gender-toggle full-width"
            />
          </section>

          <!-- 職業風險等級 -->
          <section class="field-group">
            <h2 class="field-group__label">
              <svg class="field-group__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" stroke="currentColor" stroke-width="1.6"
                  stroke-linejoin="round" />
              </svg>
              職業風險等級
            </h2>
            <q-btn-toggle
              v-model="riskLevel"
              spread
              no-caps
              unelevated
              outline
              toggle-color="primary"
              color="white"
              text-color="grey-9"
              toggle-text-color="white"
              :options="[
                { value: 'LOW', slot: 'low' },
                { value: 'MEDIUM', slot: 'medium' },
                { value: 'HIGH', slot: 'high' },
              ]"
              class="risk-toggle full-width"
            >
              <template #low>
                <div class="risk-option">
                  <div class="risk-option__title">低風險</div>
                  <div class="risk-option__caption">內勤・辦公室工作</div>
                </div>
              </template>
              <template #medium>
                <div class="risk-option">
                  <div class="risk-option__title">中風險</div>
                  <div class="risk-option__caption">外勤・駕駛或拜訪</div>
                </div>
              </template>
              <template #high>
                <div class="risk-option">
                  <div class="risk-option__title">高風險</div>
                  <div class="risk-option__caption">外送・工地等</div>
                </div>
              </template>
            </q-btn-toggle>
          </section>

          <!-- 送出按鈕 -->
          <q-btn
            type="submit"
            color="primary"
            :label="isLoading ? '試算中…' : '開始試算'"
            :loading="isLoading"
            no-caps
            unelevated
            class="full-width submit-btn"
            size="lg"
          />
        </q-form>
      </div>

      <!-- 右側：結果欄 -->
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
            <q-btn flat outline no-caps label="重新填寫" color="grey-7" @click="dismissError" />
          </div>

          <!-- 尚無結果 -->
          <div v-else-if="!result" class="result-card result-card--idle">
            <p class="result-card__placeholder-text">填寫左側資料並送出，試算結果會顯示在這裡</p>
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

              <h3 class="result-card__name">{{ result.plan_name }}</h3>

              <ul class="checklist">
                <li v-if="selectedPlan">
                  <svg class="checklist__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                  最高保障 {{ formatCurrency(selectedPlan.max_coverage) }}
                </li>
                <li v-if="selectedPlan">
                  <svg class="checklist__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                  承保年齡 {{ selectedPlan.min_age }}–{{ selectedPlan.max_age }} 歲
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
                    <span class="price-block__value">{{ formatCurrency(result.estimated_premium) }}</span>
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

              <!-- 係數長條（q-linear-progress） -->
              <div class="breakdown-bars">
                <div class="breakdown-bar">
                  <div class="breakdown-bar__row">
                    <span>基本保費</span><span>100%</span>
                  </div>
                  <q-linear-progress :value="1" color="primary" rounded size="6px" class="breakdown-progress" />
                </div>
                <div class="breakdown-bar">
                  <div class="breakdown-bar__row">
                    <span>年齡加成（係數 {{ result.age_coefficient.toFixed(2) }}）</span>
                    <span>{{ ageCoefPercent }}%</span>
                  </div>
                  <q-linear-progress :value="ageCoefPercent / 100" color="primary" rounded size="6px"
                    class="breakdown-progress" />
                </div>
                <div class="breakdown-bar">
                  <div class="breakdown-bar__row">
                    <span>職業風險加成（係數 {{ result.risk_coefficient.toFixed(2) }}）</span>
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
    </div>
  </div>
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

/* 左側輸入卡 */
.input-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.input-card__hero {
  background: var(--dark-green);
  color: var(--white);
  padding: 28px 32px;
}

.hero__eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
}

.hero__title {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
}

.hero__desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
}

.input-card__body {
  padding: 28px 32px 32px;
}

.field-group {
  margin-bottom: 26px;
}

.field-group__label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.field-group__label--inline {
  margin: 0;
}

.field-group__icon {
  width: 17px;
  height: 17px;
  color: var(--primary-color);
  flex-shrink: 0;
}

/* 保單下拉 */
.select-control {
  width: 100%;
  padding: 11px 14px;
  font-size: 15px;
  color: var(--text-main);
  background: var(--white);
  border: 1px solid var(--border-grey);
  border-radius: var(--radius-sm);
}

.select-control:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 1px;
  border-color: var(--primary-color);
}

/* 年齡滑桿 */
.slider-callout {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.slider-callout__value {
  font-size: 26px;
  font-weight: 800;
  color: var(--primary-color);
}

.slider-callout__unit {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin-left: 4px;
}

.age-slider {
  padding: 0;
}

:deep(.age-slider .q-slider__track-container) {
  height: 6px;
}

:deep(.age-slider .q-slider__thumb) {
  width: 20px;
  height: 20px;
}

.slider__bounds {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

/* 性別 / 風險 btn-toggle */
:deep(.gender-toggle .q-btn),
:deep(.risk-toggle .q-btn) {
  border-radius: var(--radius-sm) !important;
  border-color: var(--border-grey) !important;
  font-weight: 700;
}

:deep(.gender-toggle .q-btn.q-btn--active),
:deep(.risk-toggle .q-btn.q-btn--active) {
  border-color: var(--primary-color) !important;
  background: var(--light-green) !important;
  color: var(--dark-green) !important;
}

.gender-toggle,
.risk-toggle {
  gap: 10px;
}

/* 風險選項自訂內容 */
.risk-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  gap: 3px;
}

.risk-option__title {
  font-size: 13.5px;
  font-weight: 700;
}

.risk-option__caption {
  font-size: 10.5px;
  opacity: 0.72;
  line-height: 1.3;
  text-align: center;
}

/* 送出按鈕 */
.submit-btn {
  margin-top: 4px;
  border-radius: var(--radius-sm) !important;
  font-weight: 700 !important;
  letter-spacing: 0.02em;
}

/* 右側結果欄 */
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

/* 成功卡片 */
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

/* 係數長條 */
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
