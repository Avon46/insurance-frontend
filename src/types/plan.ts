// ─────────────────────────────────────────────────────────
// 後台保單管理（CRUD）- 型別定義
// 對應後端 InsurancePlan entity 與 PlanRequest DTO（camelCase JSON）
// ─────────────────────────────────────────────────────────

/** 保單分類，對應後端 @Pattern 限制 */
export type PlanCategory = 'MEDICAL' | 'ACCIDENT' | 'LIFE'

/** 保單狀態，對應後端 @Pattern 限制 */
export type PlanStatus = 'ACTIVE' | 'INACTIVE'

/** GET /plans 回傳的完整保單資料（含 DB 控管欄位） */
export interface InsurancePlan {
  id: number
  name: string
  category: PlanCategory
  description: string | null
  basePremium: number
  maxCoverage: number
  minAge: number | null
  maxAge: number | null
  status: PlanStatus | null
  sortOrder: number | null
  createdAt: string
  updatedAt: string
}

/**
 * POST /plans、PUT /plans/{id} 送出的請求 body。
 * 刻意不含 id / createdAt / updatedAt —— 由後端與 DB 控管。
 */
export interface PlanRequest {
  name: string
  category: PlanCategory
  description: string
  basePremium: number | null
  maxCoverage: number | null
  minAge: number | null
  maxAge: number | null
  status: PlanStatus
  sortOrder: number | null
}

/** 表單送出模式：決定父元件呼叫 create 還是 update */
export type PlanFormMode = 'create' | 'edit'

/** 後端 GlobalExceptionHandler 統一的錯誤格式 */
export interface ApiErrorResponse {
  success: false
  message: string
  error_code: string
  timestamp: string
}

/** 分類的中文標籤（UI 顯示用） */
export const CATEGORY_LABELS: Record<PlanCategory, string> = {
  MEDICAL: '醫療險',
  ACCIDENT: '意外險',
  LIFE: '壽險',
}

/** 狀態的中文標籤（UI 顯示用） */
export const STATUS_LABELS: Record<PlanStatus, string> = {
  ACTIVE: '上架',
  INACTIVE: '下架',
}
