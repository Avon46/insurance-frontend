<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useQuasar, type QTableColumn } from 'quasar'
import PlanFormDialog from '@/components/admin/PlanFormDialog.vue'
import DeletePlanDialog from '@/components/admin/DeletePlanDialog.vue'
import { createPlan, deletePlan, fetchPlans, updatePlan } from '@/services/planService'
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  type ApiErrorResponse,
  type InsurancePlan,
  type PlanCategory,
  type PlanFormMode,
  type PlanRequest,
} from '@/types/plan'

const $q = useQuasar()

// ── 列表狀態 ────────────────────────────────────────────
const plans = ref<InsurancePlan[]>([])
const loading = ref(false)

// 分類篩選（對應 GET /plans?category=）
const categoryFilter = ref<PlanCategory | null>(null)
const categoryFilterOptions = [
  { value: null, label: '全部分類' },
  ...(Object.keys(CATEGORY_LABELS) as PlanCategory[]).map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
  })),
]

// ── 表單視窗狀態 ────────────────────────────────────────
const formOpen = ref(false)
const formMode = ref<PlanFormMode>('create')
const editingPlan = ref<InsurancePlan | null>(null)
const submitting = ref(false)

// ── 刪除視窗狀態 ────────────────────────────────────────
const deleteOpen = ref(false)
const deletingPlan = ref<InsurancePlan | null>(null)
const deleting = ref(false)

const columns: QTableColumn<InsurancePlan>[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: '保單名稱', field: 'name', align: 'left', sortable: true },
  {
    name: 'category',
    label: '分類',
    field: 'category',
    align: 'left',
    sortable: true,
    format: (v: PlanCategory) => CATEGORY_LABELS[v] ?? v,
  },
  {
    name: 'basePremium',
    label: '基本保費',
    field: 'basePremium',
    align: 'right',
    sortable: true,
    format: (v: number) => v?.toLocaleString('zh-TW'),
  },
  {
    name: 'maxCoverage',
    label: '最高保障額度',
    field: 'maxCoverage',
    align: 'right',
    sortable: true,
    format: (v: number) => v?.toLocaleString('zh-TW'),
  },
  {
    name: 'coveragePeriod',
    label: '保障年期',
    field: 'coveragePeriod',
    align: 'center',
    sortable: true,
    format: (v: string | null) => v ?? '—',
  },
  { name: 'status', label: '狀態', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: '操作', field: 'id', align: 'center' },
]

const planCount = computed(() => plans.value.length)

function notifyError(err: unknown, fallback: string) {
  let message = fallback
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    message = err.response?.data?.message ?? err.message ?? fallback
  }
  $q.notify({ type: 'negative', message, position: 'top' })
}

async function loadPlans() {
  loading.value = true
  try {
    plans.value = await fetchPlans(categoryFilter.value ?? undefined)
  } catch (err) {
    notifyError(err, '載入保單列表失敗')
  } finally {
    loading.value = false
  }
}

// ── 新增 / 修改 ─────────────────────────────────────────
function openCreate() {
  formMode.value = 'create'
  editingPlan.value = null
  formOpen.value = true
}

function openEdit(plan: InsurancePlan) {
  formMode.value = 'edit'
  editingPlan.value = plan
  formOpen.value = true
}

// 父元件依 mode 決定要呼叫的指令：create → POST、edit → PUT
async function handleSubmit(payload: PlanRequest) {
  submitting.value = true
  try {
    if (formMode.value === 'create') {
      await createPlan(payload)
      $q.notify({ type: 'positive', message: '保單已新增', position: 'top' })
    } else if (editingPlan.value) {
      await updatePlan(editingPlan.value.id, payload)
      $q.notify({ type: 'positive', message: '保單已更新', position: 'top' })
    }
    formOpen.value = false
    await loadPlans()
  } catch (err) {
    notifyError(err, formMode.value === 'create' ? '新增保單失敗' : '更新保單失敗')
  } finally {
    submitting.value = false
  }
}

// ── 刪除 ────────────────────────────────────────────────
function openDelete(plan: InsurancePlan) {
  deletingPlan.value = plan
  deleteOpen.value = true
}

async function handleDelete(id: number) {
  deleting.value = true
  try {
    await deletePlan(id)
    $q.notify({ type: 'positive', message: '保單已刪除', position: 'top' })
    deleteOpen.value = false
    await loadPlans()
  } catch (err) {
    notifyError(err, '刪除保單失敗')
  } finally {
    deleting.value = false
  }
}

onMounted(loadPlans)
</script>

<template>
  <q-page class="plan-admin">
    <div class="plan-admin__header">
      <div>
        <h1 class="plan-admin__title">保險方案管理</h1>
        <p class="plan-admin__subtitle">共 {{ planCount }} 筆保單 · 新增、修改、刪除與分類篩選</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="新增保單"
        no-caps
        unelevated
        @click="openCreate"
      />
    </div>

    <q-card flat bordered class="plan-admin__card">
      <q-card-section class="plan-admin__toolbar">
        <q-select
          v-model="categoryFilter"
          :options="categoryFilterOptions"
          label="分類篩選"
          outlined
          dense
          emit-value
          map-options
          style="min-width: 200px"
          @update:model-value="loadPlans"
        />
        <q-space />
        <q-btn flat dense round icon="refresh" color="primary" @click="loadPlans">
          <q-tooltip>重新整理</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-table
        :rows="plans"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :rows-per-page-options="[10, 20, 50, 0]"
        no-data-label="目前沒有保單資料"
      >
        <template #body-cell-status="cellProps">
          <q-td :props="cellProps" class="text-center">
            <q-badge
              :color="cellProps.value === 'ACTIVE' ? 'green-6' : 'grey-5'"
              :label="STATUS_LABELS[cellProps.value as keyof typeof STATUS_LABELS] ?? cellProps.value"
            />
          </q-td>
        </template>

        <template #body-cell-actions="cellProps">
          <q-td :props="cellProps" class="text-center">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              size="sm"
              @click="openEdit(cellProps.row)"
            >
              <q-tooltip>修改</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="openDelete(cellProps.row)"
            >
              <q-tooltip>刪除</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- 新增 / 修改 共用視窗：由 mode 決定送出 POST 或 PUT -->
    <PlanFormDialog
      v-model="formOpen"
      :mode="formMode"
      :plan="editingPlan"
      :loading="submitting"
      @submit="handleSubmit"
    />

    <!-- 刪除防呆視窗：輸入完整 ID + 5 秒倒數 -->
    <DeletePlanDialog
      v-model="deleteOpen"
      :plan="deletingPlan"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </q-page>
</template>

<style scoped>
.plan-admin {
  padding: 28px 32px;
}

.plan-admin__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.plan-admin__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--dark-green, #007a3d);
}

.plan-admin__subtitle {
  margin: 4px 0 0;
  font-size: 13.5px;
  color: var(--text-muted, #888);
}

.plan-admin__card {
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
}

.plan-admin__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
