<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAdminAuthStore } from '@/stores/adminAuth'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const auth = useAdminAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)

function handleSubmit() {
  submitting.value = true
  const ok = auth.login(username.value.trim(), password.value)
  submitting.value = false

  if (!ok) {
    $q.notify({ type: 'negative', message: '帳號或密碼錯誤', position: 'top' })
    return
  }

  $q.notify({ type: 'positive', message: '登入成功', position: 'top' })
  // 若是被 Route Guard 導回登入頁，登入後回到原本想去的頁面
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/plans'
  router.replace(redirect)
}
</script>

<template>
  <div class="admin-login">
    <q-card class="admin-login__card" flat bordered>
      <div class="admin-login__brand">
        <div class="admin-login__mark">
          <q-icon name="admin_panel_settings" size="28px" />
        </div>
        <div>
          <h1 class="admin-login__title">後台管理系統</h1>
          <p class="admin-login__subtitle">智慧保險平台 · 管理員專用入口</p>
        </div>
      </div>

      <q-form class="admin-login__form" @submit.prevent="handleSubmit">
        <q-input
          v-model="username"
          label="管理員帳號"
          outlined
          dense
          autocomplete="username"
          :rules="[(v) => !!v || '請輸入帳號']"
        >
          <template #prepend><q-icon name="person" /></template>
        </q-input>

        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="密碼"
          outlined
          dense
          autocomplete="current-password"
          :rules="[(v) => !!v || '請輸入密碼']"
        >
          <template #prepend><q-icon name="lock" /></template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          color="primary"
          label="登入"
          class="full-width"
          unelevated
          no-caps
          :loading="submitting"
        />
      </q-form>

      <p class="admin-login__hint">
        測試帳密：<code>admin</code> / <code>admin123</code>
      </p>
    </q-card>
  </div>
</template>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, var(--dark-green, #007a3d), var(--primary-color, #05994d));
}

.admin-login__card {
  width: 100%;
  max-width: 420px;
  padding: 36px 32px;
  border-radius: var(--radius-lg, 16px);
  background: var(--white, #fff);
}

.admin-login__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.admin-login__mark {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  flex-shrink: 0;
  background: var(--light-green, #e6f5ec);
  color: var(--primary-color, #05994d);
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-login__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--dark-green, #007a3d);
}

.admin-login__subtitle {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--text-muted, #888);
}

.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-login__form .q-btn {
  margin-top: 8px;
}

.admin-login__hint {
  margin: 20px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted, #999);
}

.admin-login__hint code {
  background: var(--light-green, #e6f5ec);
  color: var(--dark-green, #007a3d);
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
