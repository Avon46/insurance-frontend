<template>
  <q-page class="recommend-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
      </div>

      <!-- Main Layout -->
      <div class="main-layout">
        <!-- Left: Search Form -->
        <div class="form-column">
          <SearchForm :loading="loading" @search="handleSearch" />
        </div>

        <!-- Right: Results -->
        <div class="result-column">
          <RecommendResult :results="results" :loading="loading" :criteria="lastCriteria" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import SearchForm from '@/components/recommend/SearchForm.vue'
import RecommendResult from '@/components/recommend/RecommendResult.vue'

import { recommendApi } from '@/services/recommendService'

import type {
  SearchCriteria,
  RecommendedPlan
} from '@/types/types'

import type {
  RecommendRequest,
  RecommendResponse
} from '@/types/recommend'

const loading = ref(false)
const results = ref<RecommendedPlan[]>([])
const lastCriteria = ref<Partial<SearchCriteria>>({})

function convertUserGroup(segment: string) {
  switch (segment) {
    case 'young_adult':
      return 'YOUNG_ADULT'

    case 'middle_aged':
      return 'MIDDLE_AGED'

    case 'senior':
      return 'SENIOR'

    default:
      return 'MIDDLE_AGED'
  }
}

function convertCoveragePeriod(period: string) {
  switch (period) {
    case 'term_10':
      return '十年期'

    case 'term_20':
      return '二十年期'

    case 'lifetime':
      return '終身'

    default:
      return '一年期'
  }
}

function convertInsuranceTypes(types: string[]) {
  const mapping: Record<string, string> = {
    life: 'LIFE',
    medical: 'MEDICAL',
    cancer: 'CANCER',
    accident: 'ACCIDENT',
    longterm_care: 'LONGTERM_CARE',
    critical: 'CRITICAL'
  }

  return types
    .map(type => mapping[type])
    .filter((value): value is string => Boolean(value))
}

async function handleSearch(criteria: SearchCriteria) {
  loading.value = true
  lastCriteria.value = criteria

  try {
    const request: RecommendRequest = {
      userGroup: convertUserGroup(criteria.segment),
      age: criteria.age,
      schedule: convertCoveragePeriod(criteria.coveragePeriod),
      budgetLimit: criteria.budget,
      primaryNeeds: convertInsuranceTypes(criteria.insuranceTypes)
    }

    const { data } = await recommendApi.recommend(request)

    results.value = data.map(
      (item: RecommendResponse): RecommendedPlan => ({
        id: String(item.id),
        name: item.name,
        types: criteria.insuranceTypes,
        basePremium: item.basePremium,
        coveragePeriod: item.coveragePeriod,
        coverageHighlights: item.highlight ?? [],
        tags: item.tags ?? [],
        rank: item.rank,
        ageScore: item.ageScore,
        budgetScore: item.budgetScore,
        score: item.score,
        aiReasonTemplate: {},
        matchingScore: item.score,
        scoreBreakdown: [
          { label: '年齡適配', score: item.ageScore },
          { label: '預算適配', score: item.budgetScore },
          { label: '整體匹配', score: item.score }
        ],
        aiReason: item.reason,
        revealed: false,
        category: item.category
      })
    )
  } catch (error) {
    console.error('推薦失敗', error)
    results.value = []
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recommend-page {
  background: linear-gradient(160deg, #E8F5EE 0%, #f4fbf7 60%, #FFFFFF 100%);
  min-height: 100vh;
  padding: 0 0 48px;
}

.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  padding: 24px 0 16px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #007A3D;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.8);
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #E5E5E5;
}

.main-layout {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .page-container {
    padding: 0 12px;
  }
}
</style>
