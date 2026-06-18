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
      <router-view />
    </q-page-container>
  </q-layout>
</template>
