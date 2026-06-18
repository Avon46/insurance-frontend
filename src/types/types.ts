// ─────────────────────────────────────────────────────────
// 智慧推薦模組 - 共用型別定義
// ─────────────────────────────────────────────────────────

/** 客群分類 */
export type Segment = 'teenager' | 'middle_aged' | 'senior'

/** 保障年期 */
export type CoveragePeriod = 'term_10' | 'term_20' | 'lifetime'

/** 險種類型 */
export type InsuranceType =
  | 'life'
  | 'medical'
  | 'cancer'
  | 'accident'
  | 'longterm_care'
  | 'critical'

/** 健康狀況 */
export type HealthStatus = 'excellent' | 'good' | 'fair'

// ─────────────────────────────────────────────────────────
// 表單相關
// ─────────────────────────────────────────────────────────

/** SearchForm 使用者輸入的搜尋條件 */
export interface SearchCriteria {
  segment: Segment
  budget: number
  coveragePeriod: CoveragePeriod
  insuranceTypes: InsuranceType[]
  healthStatus: HealthStatus
}

/** 客群選項（UI 顯示用） */
export interface SegmentOption {
  value: Segment
  label: string
  desc: string
  icon: string
}

/** 保障年期選項（UI 顯示用） */
export interface CoveragePeriodOption {
  value: CoveragePeriod
  label: string
}

/** 險種選項（UI 顯示用） */
export interface InsuranceTypeOption {
  value: InsuranceType
  label: string
  icon: string
}

/** 健康狀況選項（UI 顯示用） */
export interface HealthOption {
  value: HealthStatus
  label: string
  icon: string
  colorClass: string
}

// ─────────────────────────────────────────────────────────
// 保單與推薦結果相關
// ─────────────────────────────────────────────────────────

/** 分數拆解的單一維度 */
export interface ScoreDimension {
  label: string
  score: number
}

/** AI 推薦理由（依客群區分文案） */
export type AiReasonTemplate = Partial<Record<Segment, string>>

/** 保單原始資料（模擬資料庫的假資料） */
export interface InsurancePlan {
  id: string
  name: string
  company: string
  types: InsuranceType[]
  monthlyPremium: number
  coveragePeriod: string
  coveragePeriods: CoveragePeriod[]
  coverageHighlights: string[]
  tags: string[]
  baseScore: {
    budget: number
    typeMatch: number
    period: number
    health: number
  }
  aiReasonTemplate: AiReasonTemplate
}

/** 計算後的匹配分數結果 */
export interface MatchingScoreResult {
  total: number
  breakdown: ScoreDimension[]
}

/** 推薦結果（保單 + 計算後的分數與理由），給 RecommendResult 顯示用 */
export interface RecommendedPlan extends InsurancePlan {
  matchingScore: number
  scoreBreakdown: ScoreDimension[]
  aiReason: string
  revealed: boolean
}

// ─────────────────────────────────────────────────────────
// 客群權重規則
// ─────────────────────────────────────────────────────────

/** 單一客群的權重規則設定 */
export interface SegmentRule {
  preferredTypes: InsuranceType[]
  weightMultipliers: Partial<Record<InsuranceType, number>>
  ageLabel: string
}

/** 全部客群權重規則表 */
export type SegmentRuleMap = Record<Segment, SegmentRule>

// ─────────────────────────────────────────────────────────
// 元件 Props / Emits
// ─────────────────────────────────────────────────────────

/** SearchForm.vue Props */
export interface SearchFormProps {
  loading?: boolean
}

/** SearchForm.vue Emits */
export interface SearchFormEmits {
  (e: 'search', criteria: SearchCriteria): void
}

/** RecommendResult.vue Props */
export interface RecommendResultProps {
  results?: RecommendedPlan[]
  loading?: boolean
  criteria?: Partial<SearchCriteria>
}
