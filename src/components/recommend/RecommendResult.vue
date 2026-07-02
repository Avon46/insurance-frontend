<template>
  <div class="result-section">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-cards">
        <div v-for="n in 3" :key="n" class="skeleton-card">
          <div class="skeleton-rank"></div>
          <div class="skeleton-body">
            <div class="skeleton-line wide"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div class="skeleton-score"></div>
        </div>
      </div>
      <div class="loading-label">
        <q-spinner-dots color="primary" size="24px" />
        系統正在為您比對最適合的保單...
      </div>
    </div>

    <!-- Empty State: not searched yet -->
    <div v-else-if="!hasSearched && (!results || results.length === 0)" class="empty-state">
      <div class="empty-icon">
        <q-icon name="policy" size="56px" color="blue-grey-3" />
      </div>
      <div class="empty-title">尚未進行推薦</div>
      <div class="empty-sub">填寫上方條件後，系統將為您精選最適合的保單</div>
    </div>

    <!-- Empty State: searched but no match -->
    <div v-else-if="hasSearched && (!results || results.length === 0)" class="empty-state">
      <div class="empty-icon">
        <q-icon name="search_off" size="56px" color="blue-grey-3" />
      </div>
      <div class="empty-title">當前查詢條件沒有符合的保險方案</div>
      <div class="empty-sub">建議您調整預算或保障類型後再試一次</div>
    </div>

    <!-- Results -->
    <div v-else class="results-container">
      <div class="results-header">
        <div class="results-title">
          <q-icon name="auto_awesome" size="18px" class="gold-icon" />
          為您精選 Top {{ results.length }} 保單
        </div>
        <div class="results-meta">匹配依據：{{ criteriaText }}</div>
      </div>

      <div class="result-cards">
        <div
          v-for="(plan, index) in results"
          :key="plan.id"
          class="result-card"
          :class="[`rank-${index + 1}`, { revealed: revealedIds.has(plan.id) }]"
          @animationend="revealedIds.add(plan.id)"
        >
          <!-- Rank Badge -->
          <div class="rank-badge" :class="`badge-${index + 1}`">
            <span class="rank-num">{{ index + 1 }}</span>
          </div>

          <!-- Card Body -->
          <div class="card-main">
            <div class="plan-meta">
              <div class="plan-tags-row">
                <div class="plan-tags">
                  <span v-for="tag in plan.tags" :key="tag" class="plan-tag">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
            <div class="plan-name">{{ plan.name }}</div>

            <div class="plan-price-row">
              <div class="plan-price">
                <span class="price-label">年繳</span>
                <span class="price-value">NT$ {{ plan.basePremium.toLocaleString() }}</span>
              </div>
              <div class="plan-period">{{ plan.coveragePeriod }}</div>
            </div>
            <div class="plan-coverage">
              <div v-for="item in plan.coverageHighlights" :key="item" class="coverage-item">
                <q-icon name="check_circle" size="14px" color="positive" />
                {{ item }}
              </div>
            </div>
          </div>

          <!-- Score Ring -->
          <div class="score-section">
            <div class="score-ring-wrap">
              <svg class="score-ring" viewBox="0 0 64 64" width="64" height="64">
                <circle class="ring-bg" cx="32" cy="32" r="26" fill="none" stroke-width="6" />
                <circle
                  class="ring-fill"
                  :class="`ring-${index + 1}`"
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke-width="6"
                  stroke-linecap="round"
                  :style="ringStyle(plan.matchingScore)"
                />
              </svg>
              <div class="score-inner">
                <span class="score-num">{{ plan.matchingScore }}</span>
                <!-- <span class="score-pct">%</span> -->
              </div>
            </div>
            <div class="score-label">匹配度</div>
            <div class="score-breakdown">
              <div
                v-for="dim in plan.scoreBreakdown"
                :key="dim.label"
                class="dim-row"
                :title="`${dim.label}: ${dim.score}分`"
              >
                <span class="dim-label">{{ dim.label }}</span>
                <div class="dim-bar-wrap">
                  <div
                    class="dim-bar"
                    :style="{ width: `${(dim.score / 50) * 100}%` }"
                    :class="`dim-bar-${index + 1}`"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reason + CTA -->
          <div class="ai-reason">
            <q-icon name="psychology" size="14px" class="ai-icon" />
            <span class="ai-reason__text">{{ plan.aiReason }}</span>
            <q-btn
              flat
              no-caps
              unelevated
              size="sm"
              class="calc-btn"
              icon-right="arrow_forward"
              label="前往試算"
              @click="goToCalculator(plan.id)"
            />
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer">
        <q-icon name="info_outline" size="14px" />
        以上推薦為系統依據您的條件自動匹配，實際保費與保障條件請洽保險業務員確認。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { RecommendResultProps, InsuranceType } from '@/types/types'

const props = withDefaults(defineProps<RecommendResultProps>(), {
  results: () => [],
  loading: false,
  criteria: () => ({}),
  hasSearched: false,
})

const router = useRouter()

// Tracks which cards have finished their reveal animation, keyed by plan id.
// Kept as local component state instead of mutating `plan.revealed` on the
// prop object, since props are one-way (parent -> child) in Vue.
const revealedIds = reactive(new Set<string>())

function goToCalculator(planId: string) {
  router.push({
    name: 'premium-calculator',
    query: {
      planId,
      ...(props.criteria?.age ? { age: props.criteria.age } : {}),
    },
  })
}

const CIRCUMFERENCE = 2 * Math.PI * 26 // ~163.4

const ringStyle = (score: number): Record<string, string> => {
  const offset = CIRCUMFERENCE * (1 - score / 100)
  return {
    strokeDasharray: String(CIRCUMFERENCE),
    strokeDashoffset: String(offset),
    transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
  }
}

const insuranceTypeMap: Record<InsuranceType, string> = {
  life: '壽險',
  medical: '醫療險',
  cancer: '癌症險',
  accident: '意外險',
  longterm_care: '長照險',
  critical: '重大疾病險',
}

const criteriaText = computed<string>(() => {
  const types = props.criteria?.insuranceTypes
  if (!types) return ''
  const labels = types.map((t) => insuranceTypeMap[t] ?? t).join('、')
  return `年繳 NT$${props.criteria?.budget?.toLocaleString() ?? ''} · ${labels}`
})
</script>

<style scoped>
.result-section {
  min-height: 200px;
}

/* Loading skeleton */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border-radius: 16px;
  background: #f4fbf7;
  border: 1px solid #e5e5e5;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-rank {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e5e5e5;
  flex-shrink: 0;
}

.skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: #e5e5e5;
}

.skeleton-line.wide {
  width: 60%;
}

.skeleton-line.medium {
  width: 40%;
}

.skeleton-line.short {
  width: 25%;
}

.skeleton-score {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e5e5e5;
  flex-shrink: 0;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.loading-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  color: #333333;
  padding: 8px;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-icon {
  margin-bottom: 8px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #888888;
}

.empty-sub {
  font-size: 13px;
  color: #bbbbbb;
  text-align: center;
}

/* Results */
.results-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.results-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.results-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #007a3d;
}

.gold-icon {
  color: #05994d;
}

.results-meta {
  font-size: 12px;
  color: #888888;
}

/* Card */
.result-cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.result-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 0;
  border-radius: 16px;
  border: 2px solid #e5e5e5;
  background: #ffffff;
  overflow: hidden;
  padding: 20px 20px 0 20px;
  animation: slideUp 0.5s ease forwards;
  opacity: 0;
  transform: translateY(12px);
}

.result-card:nth-child(1) {
  animation-delay: 0.05s;
}

.result-card:nth-child(2) {
  animation-delay: 0.15s;
}

.result-card:nth-child(3) {
  animation-delay: 0.25s;
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card.rank-1 {
  border-color: #007a3d;
  box-shadow: 0 4px 20px rgba(5, 153, 77, 0.18);
}

.result-card.rank-2 {
  border-color: #05994d;
}

.result-card.rank-3 {
  border-color: #e5e5e5;
}

/* Rank badge */
.rank-badge {
  position: absolute;
  top: -1px;
  left: 20px;
  width: 36px;
  height: 36px;
  border-radius: 0 0 10px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-1 {
  background: linear-gradient(180deg, #007a3d, #005a2d);
}

.badge-2 {
  background: linear-gradient(180deg, #05994d, #007a3d);
}

.badge-3 {
  background: linear-gradient(180deg, #3dba75, #05994d);
}

.rank-num {
  font-size: 15px;
  font-weight: 800;
  color: white;
}

/* Card main content */
.card-main {
  grid-column: 1;
  grid-row: 1;
  padding-top: 28px;
  padding-right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.plan-company {
  font-size: 11px;
  font-weight: 600;
  color: #05994d;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.plan-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.plan-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: #e8f5ee;
  color: #333333;
  border-radius: 999px;
  font-weight: 500;
}

.plan-name {
  font-size: 17px;
  font-weight: 700;
  color: #007a3d;
  font-family: 'Noto Serif TC', serif;
  line-height: 1.3;
}

.plan-coverage {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 2px;
}

.coverage-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #333333;
}

.plan-price-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-label {
  font-size: 11px;
  color: #888888;
}

.price-value {
  font-size: 20px;
  font-weight: 700;
  color: #007a3d;
}

.plan-period {
  font-size: 12px;
  color: #888888;
  border-left: 1px solid #e5e5e5;
  padding-left: 16px;
}

/* Score section */
.score-section {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 24px;
  min-width: 80px;
}

.score-ring-wrap {
  position: relative;
  width: 64px;
  height: 64px;
}

.score-ring {
  transform: rotate(-90deg);
}

.ring-bg {
  stroke: #e5e5e5;
}

.ring-1 {
  stroke: #007a3d;
}

.ring-2 {
  stroke: #05994d;
}

.ring-3 {
  stroke: #3dba75;
}

.score-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
}

.score-num {
  font-size: 16px;
  font-weight: 800;
  color: #007a3d;
  line-height: 1;
}

.score-pct {
  font-size: 10px;
  color: #888888;
  align-self: flex-end;
  margin-bottom: 2px;
}

.score-label {
  font-size: 11px;
  color: #888888;
  font-weight: 500;
}

.score-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 70px;
}

.dim-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dim-label {
  font-size: 9px;
  color: #bbbbbb;
  white-space: nowrap;
}

.dim-bar-wrap {
  height: 3px;
  background: #e8f5ee;
  border-radius: 999px;
  overflow: hidden;
}

.dim-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s;
}

.dim-bar-1 {
  background: #007a3d;
}

.dim-bar-2 {
  background: #05994d;
}

.dim-bar-3 {
  background: #3dba75;
}

/* AI Reason */
.ai-reason {
  grid-column: 1 / -1;
  grid-row: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  margin: 12px -20px 0 -20px;
  background: #f4fbf7;
  border-top: 1px solid #e5e5e5;
  font-size: 12px;
  color: #333333;
  line-height: 1.5;
}

.ai-reason__text {
  flex: 1;
}

.calc-btn {
  flex-shrink: 0;
  color: #007a3d !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  border: 1px solid #007a3d !important;
  border-radius: 6px !important;
  padding: 4px 10px !important;
  white-space: nowrap;
}

.ai-icon {
  color: #05994d;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Disclaimer */
.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  color: #bbbbbb;
  padding: 0 4px;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .result-card {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .score-section {
    grid-column: 1;
    grid-row: 2;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding-top: 0;
    padding-bottom: 4px;
    gap: 12px;
  }

  .score-breakdown {
    flex-direction: row;
    gap: 8px;
  }

  .dim-bar-wrap {
    width: 40px;
  }

  .ai-reason {
    grid-row: 3;
    margin: 0 -16px;
  }
}
</style>
