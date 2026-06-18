<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import type { InsurancePlan } from '@/types/plan'

// ─────────────────────────────────────────────────────────
// 刪除保單防呆視窗。
//
// 兩道防呆機制，兩者皆滿足才可送出：
//   1. 必須在輸入框打入「完整保單 ID」
//   2. 開啟後 5 秒倒數結束才解鎖送出鍵
// ─────────────────────────────────────────────────────────

const COUNTDOWN_SECONDS = 5

const props = defineProps<{
  modelValue: boolean
  plan?: InsurancePlan | null
  /** 刪除 API 進行中（父元件控制） */
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', id: number): void
}>()

const typedId = ref('')
const secondsLeft = ref(COUNTDOWN_SECONDS)
let timer: ReturnType<typeof setInterval> | null = null

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startCountdown() {
  stopTimer()
  secondsLeft.value = COUNTDOWN_SECONDS
  timer = setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) stopTimer()
  }, 1000)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      typedId.value = ''
      startCountdown()
    } else {
      stopTimer()
    }
  },
)

onBeforeUnmount(stopTimer)

const idMatches = computed(() => !!props.plan && typedId.value.trim() === String(props.plan.id))
const countdownDone = computed(() => secondsLeft.value <= 0)
const canDelete = computed(() => idMatches.value && countdownDone.value && !props.loading)

function handleConfirm() {
  if (!canDelete.value || !props.plan) return
  emit('confirm', props.plan.id)
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
    <q-card class="delete-dialog">
      <q-card-section class="row items-center">
        <q-icon name="warning" color="negative" size="26px" class="q-mr-sm" />
        <span class="delete-dialog__title">刪除保單</span>
      </q-card-section>

      <q-separator />

      <q-card-section class="delete-dialog__body">
        <p class="delete-dialog__warn">
          此操作<strong>無法復原</strong>。確定要刪除以下保單嗎？
        </p>

        <div class="delete-dialog__target">
          <div><span class="label">ID</span>{{ plan?.id }}</div>
          <div><span class="label">名稱</span>{{ plan?.name }}</div>
        </div>

        <p class="delete-dialog__instruction">
          請在下方輸入此保單的完整 ID（<code>{{ plan?.id }}</code>）以確認刪除：
        </p>

        <q-input
          v-model="typedId"
          outlined
          dense
          placeholder="輸入保單 ID"
          :error="typedId.length > 0 && !idMatches"
          :error-message="typedId.length > 0 && !idMatches ? 'ID 不符' : undefined"
          autofocus
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="取消" color="grey-8" no-caps @click="close" />
        <q-btn
          unelevated
          color="negative"
          no-caps
          :disable="!canDelete"
          :loading="loading"
          :label="countdownDone ? '確認刪除' : `請稍候 ${secondsLeft} 秒`"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.delete-dialog {
  width: 460px;
  max-width: 92vw;
  border-radius: var(--radius-lg, 16px);
}

.delete-dialog__title {
  font-size: 17px;
  font-weight: 800;
  color: var(--negative, #c0392b);
}

.delete-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.delete-dialog__warn {
  margin: 0;
  font-size: 14px;
  color: var(--text-main, #333);
}

.delete-dialog__target {
  background: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: var(--radius-md, 10px);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.delete-dialog__target .label {
  display: inline-block;
  width: 48px;
  font-weight: 700;
  color: var(--text-muted, #888);
}

.delete-dialog__instruction {
  margin: 0;
  font-size: 13.5px;
  color: var(--text-muted, #666);
}

.delete-dialog__instruction code {
  background: #fdecea;
  color: var(--negative, #c0392b);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}
</style>
