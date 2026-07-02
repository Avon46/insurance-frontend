<template>
  <q-card class="search-form-card" flat bordered>
    <q-card-section class="form-header">
      <div class="header-eyebrow">智慧推薦系統</div>
      <div class="header-title">找到最適合您的保障</div>
      <div class="header-sub">輸入預算與需求，系統為您精選 Top 3 保單</div>
    </q-card-section>

    <q-separator />

    <q-card-section class="form-body">
      <div class="form-grid">
        <!-- 客群選擇 -->
        <div class="form-group full-width">
          <div class="field-label">
            <q-icon name="people" size="16px" class="label-icon" />
            您的身份
          </div>
          <div class="segment-group">
            <button v-for="seg in segments" :key="seg.value" class="segment-btn"
              :class="{ active: form.segment === seg.value }" @click="form.segment = seg.value">
              <q-icon :name="seg.icon" size="20px" />
              <span>{{ seg.label }}</span>
              <span class="seg-desc">{{ seg.desc }}</span>
            </button>
          </div>
        </div>

        <!-- 年齡 -->
        <div class="form-group full-width">
          <div class="field-label">
            <q-icon name="cake" size="16px" class="label-icon" />
            年齡
          </div>

          <q-input v-model.number="form.age" type="number" outlined dense placeholder="請輸入年齡" :rules="[
            (val) => (val !== null && val !== undefined) || '請輸入年齡',
            (val) => (val > 0 && val <= 120) || '請輸入正確年齡',
          ]" class="age-input">
          </q-input>
        </div>

        <!-- 預算上限 -->
        <div class="form-group full-width">
          <div class="field-label">
            <q-icon name="account_balance_wallet" size="16px" class="label-icon" />
            年繳預算上限
          </div>
          <div class="budget-display">
            <q-input v-model="form.budget" type="number" outlined dense prefix="NT$"></q-input>
          </div>
        </div>

        <!-- 保障年期 -->
        <div class="form-group full-width">
          <div class="field-label">
            <q-icon name="schedule" size="16px" class="label-icon" />
            希望保障年期
          </div>
          <div class="radio-group">
            <label v-for="opt in coveragePeriods" :key="opt.value" class="radio-card"
              :class="{ active: form.coveragePeriod === opt.value }">
              <input type="radio" v-model="form.coveragePeriod" :value="opt.value" hidden />
              <span class="radio-label">{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <!-- 險種需求 (可多選) -->
        <div class="form-group full-width">
          <div class="field-label">
            <q-icon name="security" size="16px" class="label-icon" />
            核心險種需求
            <span class="hint">可複選</span>
          </div>
          <div class="insurance-types-grid">
            <label v-for="type in insuranceTypes" :key="type.value" class="type-chip"
              :class="{ active: form.insuranceTypes.includes(type.value) }" @click="toggleType(type.value)">
              <q-icon :name="type.icon" size="18px" />
              <span>{{ type.label }}</span>
              <q-icon v-if="form.insuranceTypes.includes(type.value)" name="check_circle" size="14px"
                class="check-icon" />
            </label>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="form-footer">
      <q-btn class="search-btn full-width" unelevated :loading="loading" :disable="!isFormValid" @click="onSubmit">
        <q-icon name="auto_awesome" size="18px" class="q-mr-sm" />
        系統推薦
        <template #loading>
          <q-spinner-dots color="white" />
        </template>
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type {
  SearchFormProps,
  SearchFormEmits,
  SearchCriteria,
  SegmentOption,
  CoveragePeriodOption,
  InsuranceTypeOption,
  InsuranceType,
} from '@/types/types'

withDefaults(defineProps<SearchFormProps>(), {
  loading: false,
})

const emit = defineEmits<SearchFormEmits>()

const form = ref<SearchCriteria>({
  segment: 'young_adult',
  age: 18,
  budget: 3000,
  coveragePeriod: 'lifetime',
  insuranceTypes: ['medical', 'critical'],
})

const segments: SegmentOption[] = [
  { value: 'young_adult', label: '青年族群', desc: '18-34 歲', icon: 'directions_run' },
  { value: 'middle_aged', label: '中年族群', desc: '35–55 歲', icon: 'person' },
  { value: 'senior', label: '銀髮族群', desc: '55 歲以上', icon: 'elderly' },
]

const coveragePeriods: CoveragePeriodOption[] = [
  { value: 'term_1', label: '1 年期' },
  { value: 'term_10', label: '10 年期' },
  { value: 'term_20', label: '20 年期' },
  { value: 'lifetime', label: '終身' },
]

const insuranceTypes: InsuranceTypeOption[] = [
  { value: 'life', label: '壽險', icon: 'favorite_border' },
  { value: 'medical', label: '醫療險', icon: 'local_hospital' },
  { value: 'cancer', label: '癌症險', icon: 'biotech' },
  { value: 'accident', label: '意外險', icon: 'warning_amber' },
  { value: 'longterm_care', label: '長照險', icon: 'elderly_woman' },
  { value: 'critical', label: '重大疾病險', icon: 'monitor_heart' },
]

const toggleType = (val: InsuranceType): void => {
  const idx = form.value.insuranceTypes.indexOf(val)
  if (idx > -1) {
    form.value.insuranceTypes.splice(idx, 1)
  } else {
    form.value.insuranceTypes.push(val)
  }
}

// 依年齡自動判斷身分族群
// 18-30 歲：青年族群／35-55 歲：中年族群／55 歲以上：銀髮族群
// 31-34 歲為區間外空隙，暫歸入中年族群，可依需求調整
const matchSegmentByAge = (age: number): SearchCriteria['segment'] | null => {
  if (age >= 18 && age <= 34) return 'young_adult'
  if (age >= 35 && age <= 55) return 'middle_aged'
  if (age > 55) return 'senior'
  return null // 小於 18 歲，不自動切換，保留使用者目前選擇
}

watch(
  () => form.value.age,
  (newAge) => {
    if (newAge === null || newAge === undefined || newAge <= 0) return
    const matched = matchSegmentByAge(newAge)
    if (matched) {
      form.value.segment = matched
    }
  },
)

const isFormValid = computed<boolean>(() => form.value.insuranceTypes.length > 0)

/*const summaryText = computed<string>(() => {
  if (!isFormValid.value) return ''
  const seg = segments.find((s) => s.value === form.value.segment)?.label
  const types = form.value.insuranceTypes
    .map((t) => insuranceTypes.find((i) => i.value === t)?.label)
    .join('、')
  return `${seg} · 月繳 NT$${form.value.budget.toLocaleString()} · ${types}`
})*/

const onSubmit = (): void => {
  emit('search', { ...form.value })
}
</script>

<style scoped>
.search-form-card {
  border-radius: 16px !important;
  border: 1px solid #e5e5e5 !important;
  overflow: hidden;
  background: #ffffff;
}

.form-header {
  background: linear-gradient(135deg, #007a3d 0%, #05994d 100%);
  padding: 28px 32px;
}

.header-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #e8f5ee;
  margin-bottom: 8px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
  font-family: 'Noto Serif TC', serif;
}

.header-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.form-body {
  padding: 28px 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #007a3d;
  letter-spacing: 0.3px;
}

.label-icon {
  color: #05994d;
}

.hint {
  font-size: 11px;
  color: #888888;
  font-weight: 400;
  margin-left: 4px;
}

/* Segment */
.segment-group {
  display: flex;
  gap: 12px;
}

.segment-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 12px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  cursor: pointer;
  background: #f4fbf7;
  transition: all 0.2s;
  font-family: inherit;
}

.segment-btn:hover {
  border-color: #05994d;
  background: #e8f5ee;
}

.segment-btn.active {
  border-color: #007a3d;
  background: #e8f5ee;
}

.segment-btn span:nth-child(2) {
  font-size: 14px;
  font-weight: 600;
  color: #007a3d;
}

.seg-desc {
  font-size: 11px;
  color: #888888;
}

/* Budget */
.budget-display {
  font-size: 13px;
  color: #333333;
}

.budget-value {
  font-size: 22px;
  font-weight: 700;
  color: #007a3d;
  margin-left: 2px;
}

.budget-slider {
  margin: 4px 0;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888888;
}

/* Coverage Period */
.radio-group {
  display: flex;
  gap: 8px;
}

.radio-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #333333;
  background: #f4fbf7;
  transition: all 0.2s;
}

.radio-card:hover {
  border-color: #05994d;
}

.radio-card.active {
  border-color: #05994d;
  background: #e8f5ee;
  color: #005a2d;
  font-weight: 600;
}

/* Insurance Types */
.insurance-types-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.type-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 2px solid #e5e5e5;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #333333;
  background: #f4fbf7;
  position: relative;
  transition: all 0.2s;
  user-select: none;
}

.type-chip:hover {
  border-color: #05994d;
  color: #007a3d;
}

.type-chip.active {
  border-color: #007a3d;
  background: #007a3d;
  color: #ffffff;
}

.check-icon {
  color: #e8f5ee;
}

/* Health */
.health-options {
  display: flex;
  gap: 12px;
}

.health-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  cursor: pointer;
  background: #f4fbf7;
  transition: all 0.2s;
}

.health-card:hover {
  border-color: #05994d;
  background: #e8f5ee;
}

.health-card.active {
  border-color: #007a3d;
  background: #e8f5ee;
}

.health-label {
  font-size: 12px;
  font-weight: 500;
  color: #007a3d;
}

/* Footer */
.form-footer {
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f4fbf7;
}

.form-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #333333;
  flex: 1;
}

.search-btn {
  background: linear-gradient(135deg, #05994d, #007a3d) !important;
  color: white !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  padding: 10px 28px !important;
  border-radius: 10px !important;
  letter-spacing: 0.5px;
  transition: all 0.2s !important;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(5, 153, 77, 0.35) !important;
}

.search-btn:disabled {
  opacity: 0.5;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-body {
    padding: 20px 16px;
  }

  .form-header {
    padding: 20px 16px;
  }

  .form-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 16px;
  }

  .segment-group {
    flex-direction: column;
  }

  .health-options {
    flex-direction: column;
  }
}
</style>
