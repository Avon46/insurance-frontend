<script setup lang="ts">
import { ref, watch } from 'vue'
import type { QForm } from 'quasar'
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  type InsurancePlan,
  type PlanCategory,
  type PlanFormMode,
  type PlanRequest,
  type PlanStatus,
} from '@/types/plan'

// ─────────────────────────────────────────────────────────
// 新增 / 修改保單共用視窗。
//
// 新增與修改使用「同一個」表單元件，差別只在父元件：
//   - mode="create" → 父元件收到 submit 後呼叫 POST /plans
//   - mode="edit"   → 父元件收到 submit 後呼叫 PUT  /plans/{id}
// 由 plan-admin 列表旁的「修改」鈕進入時，父元件傳入 plan，
// 本元件會把當前資料預填進欄位。
// ─────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: boolean
  /** 由父元件指定本次要送出的指令種類 */
  mode: PlanFormMode
  /** mode="edit" 時的當前保單資料，用於預填 */
  plan?: InsurancePlan | null
  /** 送出 API 進行中（父元件控制） */
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', payload: PlanRequest): void
}>()

const categoryOptions = (Object.keys(CATEGORY_LABELS) as PlanCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}))

const statusOptions = (Object.keys(STATUS_LABELS) as PlanStatus[]).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))

const formRef = ref<QForm | null>(null)

function emptyForm(): PlanRequest {
  return {
    name: '',
    category: 'MEDICAL',
    description: '',
    basePremium: null,
    maxCoverage: null,
    minAge: null,
    maxAge: null,
    status: 'ACTIVE',
    sortOrder: null,
  }
}

const form = ref<PlanRequest>(emptyForm())

// 視窗開啟時：edit 模式預填當前資料，create 模式清空
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    if (props.mode === 'edit' && props.plan) {
      const p = props.plan
      form.value = {
        name: p.name,
        category: p.category,
        description: p.description ?? '',
        basePremium: p.basePremium,
        maxCoverage: p.maxCoverage,
        minAge: p.minAge,
        maxAge: p.maxAge,
        status: p.status ?? 'ACTIVE',
        sortOrder: p.sortOrder,
      }
    } else {
      form.value = emptyForm()
    }
    formRef.value?.resetValidation()
  },
)

// 對應後端 PlanRequest 的驗證規則
const required = (v: unknown) => (v !== null && v !== '' && v !== undefined) || '此欄位為必填'
const nonNegative = (v: number | null) => v === null || v >= 0 || '不可為負數'

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  // 送出前正規化：description 去頭尾空白
  emit('submit', { ...form.value, description: form.value.description.trim() })
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="plan-form">
      <q-card-section class="plan-form__header row items-center">
        <q-icon
          :name="mode === 'create' ? 'add_circle' : 'edit'"
          color="primary"
          size="24px"
          class="q-mr-sm"
        />
        <span class="plan-form__title">
          {{ mode === 'create' ? '新增保單方案' : `修改保單方案 #${plan?.id}` }}
        </span>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" class="plan-form__body" @submit.prevent="handleSubmit">
          <q-input
            v-model="form.name"
            label="保單名稱 *"
            outlined
            dense
            maxlength="100"
            counter
            :rules="[required, (v) => v.length <= 100 || '長度不可超過 100 字']"
          />

          <div class="row q-col-gutter-md">
            <q-select
              v-model="form.category"
              :options="categoryOptions"
              label="分類 *"
              outlined
              dense
              emit-value
              map-options
              class="col-12 col-sm-6"
              :rules="[required]"
            />
            <q-select
              v-model="form.status"
              :options="statusOptions"
              label="狀態 *"
              outlined
              dense
              emit-value
              map-options
              class="col-12 col-sm-6"
            />
          </div>

          <q-input
            v-model="form.description"
            label="保單簡介"
            type="textarea"
            outlined
            dense
            autogrow
            maxlength="255"
            counter
            :rules="[(v) => v.length <= 255 || '長度不可超過 255 字']"
          />

          <div class="row q-col-gutter-md">
            <q-input
              v-model.number="form.basePremium"
              label="基本保費 *"
              type="number"
              outlined
              dense
              class="col-12 col-sm-6"
              :rules="[required, nonNegative]"
            />
            <q-input
              v-model.number="form.maxCoverage"
              label="最高保障額度 *"
              type="number"
              outlined
              dense
              class="col-12 col-sm-6"
              :rules="[required, nonNegative]"
            />
          </div>

          <div class="row q-col-gutter-md">
            <q-input
              v-model.number="form.minAge"
              label="最低承保年齡"
              type="number"
              outlined
              dense
              class="col-12 col-sm-4"
              :rules="[nonNegative]"
            />
            <q-input
              v-model.number="form.maxAge"
              label="最高承保年齡"
              type="number"
              outlined
              dense
              class="col-12 col-sm-4"
              :rules="[nonNegative]"
            />
            <q-input
              v-model.number="form.sortOrder"
              label="排序"
              type="number"
              outlined
              dense
              class="col-12 col-sm-4"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="取消" color="grey-8" no-caps @click="close" />
        <q-btn
          unelevated
          color="primary"
          no-caps
          :label="mode === 'create' ? '新增' : '儲存修改'"
          :loading="loading"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.plan-form {
  width: 560px;
  max-width: 92vw;
  border-radius: var(--radius-lg, 16px);
}

.plan-form__title {
  font-size: 17px;
  font-weight: 800;
  color: var(--dark-green, #007a3d);
}

.plan-form__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
