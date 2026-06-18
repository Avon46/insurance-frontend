<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="sidebar">
    <div class="sidebar__brand">
      <div class="brand__mark">管</div>
      <div class="brand__name">後台管理系統</div>
    </div>

    <q-list padding>
      <!-- 模組 1：管理員專用的保單 CRUD -->
      <q-item
        clickable
        to="/admin/plans"
        exact
        :active="route.path === '/admin/plans'"
        active-class="menu-active"
      >
        <q-item-section avatar>
          <q-icon name="assignment" />
        </q-item-section>
        <q-item-section>保險方案管理</q-item-section>
      </q-item>

      <!-- 模組 2：與一般使用者相同的試算頁面 -->
      <q-item
        clickable
        to="/admin/calculator"
        exact
        :active="route.path === '/admin/calculator'"
        active-class="menu-active"
      >
        <q-item-section avatar>
          <q-icon name="calculate" />
        </q-item-section>
        <q-item-section>保費試算</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>
.sidebar {
  height: 100%;
  background: var(--dark-green, #007a3d);
  color: var(--white, #ffffff);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-grey, rgba(255, 255, 255, 0.15));
}

.brand__mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: var(--white, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.brand__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--white, #ffffff);
}

:deep(.q-item) {
  border-radius: 10px;
  margin: 4px 8px;
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.2s ease;
}

:deep(.q-item:hover) {
  background: var(--primary-color, #05994d);
  color: var(--white, #ffffff);
}

:deep(.menu-active) {
  background: var(--primary-color, #05994d);
  color: var(--white, #ffffff);
  font-weight: 600;
}

:deep(.q-item .q-icon) {
  color: inherit;
}
</style>
