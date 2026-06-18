<template>
  <q-page class="recommend-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="brand-mark">
          <q-icon name="shield" size="20px" />
          保險智慧推薦
        </div>
      </div>

      <!-- Main Layout -->
      <div class="main-layout">
        <!-- Left: Search Form -->
        <div class="form-column">
          <SearchForm :loading="loading" @search="handleSearch" />
        </div>

        <!-- Right: Results -->
        <div class="result-column">
          <RecommendResult
            :results="results"
            :loading="loading"
            :criteria="lastCriteria"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchForm from '@/components/recommend/SearchForm.vue'
import RecommendResult from '@/components/recommend/RecommendResult.vue';

import type {
  SearchCriteria,
  InsurancePlan,
  RecommendedPlan,
  MatchingScoreResult,
  SegmentRuleMap,
  Segment
} from '@/types/types'

const loading = ref<boolean>(false)
const results = ref<RecommendedPlan[]>([])
const lastCriteria = ref<Partial<SearchCriteria>>({})

// ─────────────────────────────────────────────
// 客群權重規則 (後端邏輯於前端模擬)
// ─────────────────────────────────────────────
const SEGMENT_RULES: SegmentRuleMap = {
  teenager: {
    preferredTypes: ['life', 'medical', 'critical'],
    weightMultipliers: { life: 1.3, critical: 1.2, cancer: 1.1, accident: 1.0, longterm_care: 0.8, medical: 1.15 },
    ageLabel: '青少年'
  },
  middle_aged: {
    preferredTypes: ['life', 'medical', 'critical'],
    weightMultipliers: { life: 1.3, critical: 1.2, cancer: 1.1, accident: 1.0, longterm_care: 0.8, medical: 1.15 },
    ageLabel: '中年族群'
  },
  senior: {
    preferredTypes: ['medical', 'longterm_care', 'cancer'],
    weightMultipliers: { longterm_care: 1.5, cancer: 1.3, medical: 1.2, critical: 1.0, accident: 0.9, life: 0.8 },
    ageLabel: '銀髮族群'
  }
}

// ─────────────────────────────────────────────
// AI 假資料庫 (由 AI 生成的模擬保單)
// ─────────────────────────────────────────────
const MOCK_PLANS: InsurancePlan[] = [
  {
    id: 'P001',
    name: '全方位守護終身壽險',
    company: '台灣人壽',
    types: ['life', 'critical'],
    monthlyPremium: 2800,
    coveragePeriod: '終身',
    coveragePeriods: ['lifetime'],
    coverageHighlights: ['身故保障 300 萬', '重大疾病提前給付', '豁免後續保費'],
    tags: ['熱門', '高保障'],
    baseScore: { budget: 85, typeMatch: 90, period: 95, health: 85 },
    aiReasonTemplate: {
      middle_aged: '壽險保障達 300 萬，搭配重大疾病提前給付，完整覆蓋中年家庭支柱的核心風險，月繳符合您的預算範圍。',
      senior: '此方案重大疾病保障佳，但長照功能較弱，建議搭配長照險使用。'
    }
  },
  {
    id: 'P002',
    name: '安心醫療實支實付險',
    company: '富邦人壽',
    types: ['medical'],
    monthlyPremium: 1500,
    coveragePeriod: '終身',
    coveragePeriods: ['lifetime'],
    coverageHighlights: ['住院日額 NT$2,000', '手術費用實支給付', '門診手術適用'],
    tags: ['CP值高'],
    baseScore: { budget: 95, typeMatch: 88, period: 80, health: 90 },
    aiReasonTemplate: {
      middle_aged: '醫療費用逐年攀升，此方案以實支實付模式有效補足健保缺口，月繳僅 1,500 元，預算友善。',
      senior: '銀髮族住院風險較高，實支實付醫療險能大幅降低自費醫療負擔，強烈建議列入首選。'
    }
  },
  {
    id: 'P003',
    name: '樂活長期照護保險',
    company: '國泰人壽',
    types: ['longterm_care'],
    monthlyPremium: 3200,
    coveragePeriod: '終身',
    coveragePeriods: ['lifetime'],
    coverageHighlights: ['每月 NT$30,000 長照給付', '一次性生活輔具補助', '居家/機構均適用'],
    tags: ['銀髮優選', '終身'],
    baseScore: { budget: 75, typeMatch: 80, period: 95, health: 75 },
    aiReasonTemplate: {
      middle_aged: '提早規劃長照，保費較年長時更低，此方案可在需要長照時每月給付 3 萬元，是責任型規劃的好選擇。',
      senior: '長照需求是銀髮族最大風險，此方案每月 3 萬元給付可支應大部分照護費用，強烈建議配置。'
    }
  },
  {
    id: 'P004',
    name: '勇士意外傷害保險',
    company: '新光人壽',
    types: ['accident'],
    monthlyPremium: 600,
    coveragePeriod: '一年期',
    coveragePeriods: ['term_10', 'term_20'],
    coverageHighlights: ['意外身故 500 萬', '意外失能分級給付', '交通意外加倍理賠'],
    tags: ['保費低', '高保額'],
    baseScore: { budget: 98, typeMatch: 75, period: 60, health: 95 },
    aiReasonTemplate: {
      middle_aged: '月繳僅 600 元，意外保障高達 500 萬，適合已有基礎壽險但希望強化意外防護的中年族群。',
      senior: '此方案意外保障優異，但請注意承保年齡限制，建議搭配醫療險確保完整保障。'
    }
  },
  {
    id: 'P005',
    name: '防癌終身保障計畫',
    company: '中國人壽',
    types: ['cancer'],
    monthlyPremium: 1800,
    coveragePeriod: '終身',
    coveragePeriods: ['lifetime'],
    coverageHighlights: ['癌症確診一次給付 100 萬', '化療/放療津貼', '癌症身故保障'],
    tags: ['專項防護'],
    baseScore: { budget: 90, typeMatch: 85, period: 90, health: 80 },
    aiReasonTemplate: {
      middle_aged: '台灣每 10 分鐘新增一名癌症患者，此方案確診即給付 100 萬，可支付初期龐大治療費用。',
      senior: '銀髮族罹癌風險大幅提升，癌症險是必備保障，此方案終身有效且保費合理。'
    }
  },
  {
    id: 'P006',
    name: '健康守護重大疾病險',
    company: '南山人壽',
    types: ['critical'],
    monthlyPremium: 2200,
    coveragePeriod: '終身',
    coveragePeriods: ['lifetime'],
    coverageHighlights: ['七大重症一次給付 200 萬', '輕度重症提前理賠', '保費豁免附加'],
    tags: ['全方位', '主力險'],
    baseScore: { budget: 88, typeMatch: 92, period: 90, health: 85 },
    aiReasonTemplate: {
      middle_aged: '心臟病、腦中風等重大疾病好發於 45 歲後，此方案確診即給付 200 萬元，保障家庭不因重病而財務崩潰。',
      senior: '重大疾病在銀髮族中極為常見，200 萬一次給付可應對醫療及後續照護雙重需求。'
    }
  }
]

// ─────────────────────────────────────────────
// 核心：匹配分數計算引擎
// ─────────────────────────────────────────────
function calculateMatchingScore(
  plan: InsurancePlan,
  criteria: SearchCriteria,
  rules: SegmentRuleMap[Segment]
): MatchingScoreResult | null {
  // 1. 預算過濾
  if (plan.monthlyPremium > criteria.budget) return null

  // 2. 險種匹配 (必要條件：至少一個險種符合)
  const typeOverlap = plan.types.filter(t => criteria.insuranceTypes.includes(t))
  if (typeOverlap.length === 0) return null

  // 3. 基礎分數計算
  const budgetScore = Math.min(100, Math.round((criteria.budget - plan.monthlyPremium) / criteria.budget * 50 + 60))
  const typeScore = Math.round((typeOverlap.length / criteria.insuranceTypes.length) * 100)
  const periodScore = plan.coveragePeriods.includes(criteria.coveragePeriod) ? 95 : 65
  const healthScore = criteria.healthStatus === 'fair' ? 70 : criteria.healthStatus === 'good' ? 85 : 95

  // 4. 客群權重加乘
  const multiplier = typeOverlap.reduce((max, type) => {
    const m = rules.weightMultipliers[type] ?? 1.0
    return Math.max(max, m)
  }, 1.0)

  // 5. 加權平均
  const raw = (budgetScore * 0.25 + typeScore * 0.35 + periodScore * 0.2 + healthScore * 0.2) * multiplier
  const final = Math.min(98, Math.round(raw))

  return {
    total: final,
    breakdown: [
      { label: '預算符合', score: budgetScore },
      { label: '險種匹配', score: typeScore },
      { label: '年期匹配', score: periodScore },
      // { label: '健康評估', score: healthScore }
    ]
  }
}

// ─────────────────────────────────────────────
// 主搜尋處理
// ─────────────────────────────────────────────
async function handleSearch(criteria: SearchCriteria): Promise<void> {
  loading.value = true
  results.value = []
  lastCriteria.value = criteria

  // 模擬 API 延遲
  await new Promise<void>(resolve => setTimeout(resolve, 1800))

  const rules = SEGMENT_RULES[criteria.segment]

  const scored: RecommendedPlan[] = MOCK_PLANS
    .map((plan): RecommendedPlan | null => {
      const score = calculateMatchingScore(plan, criteria, rules)
      if (!score) return null
      return {
        ...plan,
        matchingScore: score.total,
        scoreBreakdown: score.breakdown,
        aiReason: plan.aiReasonTemplate[criteria.segment] ?? plan.aiReasonTemplate.middle_aged ?? '',
        revealed: false
      }
    })
    .filter((p): p is RecommendedPlan => p !== null)
    .sort((a, b) => b.matchingScore - a.matchingScore)
    .slice(0, 3)

  results.value = scored
  loading.value = false
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
  background: rgba(255,255,255,0.8);
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
