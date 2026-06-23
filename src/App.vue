<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { useAdminAuthStore } from '@/stores/adminAuth'

const route = useRoute()
const router = useRouter()
const auth = useAdminAuthStore()

const drawer = ref(false)

// 依路由 meta 決定版面：blank（登入頁）/ admin（後台）/ public（一般）
const isBlank = computed(() => route.meta.layout === 'blank')
const isAdmin = computed(() => route.meta.area === 'admin')

function logout() {
  if (isAdmin.value) {
    auth.logout()
    router.replace({ name: 'admin-login' })
    return
  }
  console.log('logout')
}
</script>

<template>
  <!-- 登入頁：不套用任何主版面 -->
  <router-view v-if="isBlank" />

  <!-- 一般 / 後台：共用 q-layout，僅切換側欄與登出行為 -->
  <q-layout v-else view="lHh Lpr lFf">
    <q-header class="bg-primary text-white" elevated>
      <q-toolbar>
        <!-- 漢堡 -->
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />

        <q-toolbar-title>
          {{ isAdmin ? '後台管理系統' : '' }}
        </q-toolbar-title>

        <!-- 身分提示 highlight（僅後台顯示） -->
        <q-chip
          v-if="isAdmin"
          dense
          square
          color="amber-8"
          text-color="white"
          icon="admin_panel_settings"
          class="admin-badge q-mr-sm"
        >
          管理員身分
        </q-chip>

        <!-- 登出（僅後台顯示） -->
        <q-btn
          v-if="isAdmin"
          flat
          dense
          icon="logout"
          label="登出"
          @click="logout"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      :width="220"
      class="bg-secondary text-white"
    >
      <AdminSidebar v-if="isAdmin" />
      <AppSidebar v-else />
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <!-- 身分提示 highlight 橫幅：提醒目前處於管理員操作介面 -->
      <q-banner v-if="isAdmin" dense class="admin-identity-banner">
        <template #avatar>
          <q-icon name="verified_user" color="white" />
        </template>
        您目前正以 <strong>管理員</strong> 身分操作後台 —— 所有保單異動將即時寫入資料庫，請謹慎操作。
      </q-banner>

      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.admin-badge {
  font-weight: 700;
  letter-spacing: 0.04em;
}

.admin-identity-banner {
  background: linear-gradient(90deg, #b8860b, #d9a406);
  color: #fff;
  font-size: 13.5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.admin-identity-banner strong {
  font-weight: 800;
}

.admin-identity-banner :deep(.q-banner__avatar) {
  align-self: center;
}
</style>
