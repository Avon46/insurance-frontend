<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'

const leftDrawerOpen = ref(false)
const isMini = ref(false)
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="220"
      :mini-width="60"
      :mini="isMini"
      :breakpoint="760"
      style="background: var(--dark-green)"
    >
      <AppSidebar :mini="isMini" @toggle="isMini = !isMini" />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
