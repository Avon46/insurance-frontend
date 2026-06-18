<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'

const drawer = ref(false)

function logout() {
  console.log('logout')
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">

    <!-- Header（主綠色） -->
    <q-header class="bg-primary text-white" elevated>
      <q-toolbar>

        <!-- 漢堡 -->
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />

        <q-toolbar-title>
          <!-- 智慧保險平台 -->
        </q-toolbar-title>

        <!-- 登出 -->
        <q-btn flat dense icon="logout" label="登出" @click="logout" />

      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer v-model="drawer" show-if-above bordered :width="220" class="bg-secondary text-white">
      <AppSidebar />
    </q-drawer>

    <!-- Page -->
    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>

  </q-layout>
</template>
