<script setup lang="ts">
import type { Gender, RiskLevel, PlanCategory, InsurancePlanOption } from '@/types/premium'

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

defineProps<{
  plans: InsurancePlanOption[]
  isLoadingPlans: boolean
  planId: number
  age: number
  gender: Gender
  riskLevel: RiskLevel
  selectedPlan: InsurancePlanOption | undefined
  isLoading: boolean
}>()

const emit = defineEmits<{
  'update:planId': [value: number]
  'update:age': [value: number]
  'update:gender': [value: Gender]
  'update:riskLevel': [value: RiskLevel]
  'submit': []
}>()
</script>

<template>
  <div class="input-card">
    <div class="input-card__hero">
      <p class="hero__eyebrow">保費試算系統</p>
      <h1 class="hero__title">幾個問題，看見您的預估保費</h1>
      <p class="hero__desc">輸入年齡、性別與職業風險，立即試算對應方案的保費，協助您評估個人的經濟負擔。</p>
    </div>

    <q-form class="input-card__body" novalidate @submit.prevent="emit('submit')">

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
        <select id="plan" class="select-control" :value="planId" :disabled="isLoadingPlans"
          @change="emit('update:planId', Number(($event.target as HTMLSelectElement).value))">
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
        <q-slider :model-value="age" :min="selectedPlan?.minAge ?? 0" :max="selectedPlan?.maxAge ?? 100" :step="1"
          color="primary" class="age-slider" @update:model-value="emit('update:age', $event as number)" />
        <div class="slider__bounds">
          <span>{{ selectedPlan?.minAge ?? 0 }} 歲</span>
          <span>{{ selectedPlan?.maxAge ?? 100 }} 歲</span>
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
        <div class="btn-group gender-toggle full-width">
          <q-btn v-for="opt in [{ label: '男', value: 'M' }, { label: '女', value: 'F' }]" :key="opt.value" flat no-caps
            :label="opt.label" :class="{ 'tgl-active': gender === opt.value }"
            @click="emit('update:gender', opt.value as Gender)" />
        </div>
      </section>

      <!-- 職業風險等級 -->
      <section class="field-group">
        <h2 class="field-group__label">
          <q-icon name="security" size="16px" class="label-icon" />
          職業風險等級
        </h2>
        <div class="btn-group risk-toggle full-width">
          <q-btn v-for="opt in riskLevelOptions" :key="opt.value" flat no-caps
            :class="{ 'tgl-active': riskLevel === opt.value }" @click="emit('update:riskLevel', opt.value)">
            <div class="risk-option">
              <div class="risk-option__title">{{ opt.shortLabel }}</div>
              <div class="risk-option__caption">{{ opt.caption }}</div>
            </div>
          </q-btn>
        </div>
      </section>

      <!-- 送出按鈕 -->
      <q-btn type="submit" color="primary" :label="isLoading ? '試算中…' : '開始試算'" :loading="isLoading" no-caps unelevated
        class="full-width submit-btn" size="lg" />

    </q-form>
  </div>
</template>

<style scoped>
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
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #e8f5ee;
  margin-bottom: 8px;
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

.label-icon {
  color: #05994d;
}

.field-group__icon {
  width: 17px;
  height: 17px;
  color: var(--primary-color);
  flex-shrink: 0;
}

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

.btn-group {
  display: flex;
  gap: 10px;
}

:deep(.gender-toggle .q-btn),
:deep(.risk-toggle .q-btn) {
  flex: 1;
  border-radius: var(--radius-sm) !important;
  border: 1.5px solid var(--border-grey) !important;
  background: var(--white) !important;
  color: var(--text-main) !important;
  font-weight: 700;
}

:deep(.gender-toggle .q-btn.tgl-active),
:deep(.risk-toggle .q-btn.tgl-active) {
  border-color: var(--primary-color) !important;
  background: var(--light-green) !important;
  color: var(--dark-green) !important;
}

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

.submit-btn {
  margin-top: 4px;
  border-radius: var(--radius-sm) !important;
  font-weight: 700 !important;
  letter-spacing: 0.02em;
}
</style>
