<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="sidebar">
    <!-- Logo -->
    <div class="sidebar__brand">
      <div class="brand__mark">保</div>
      <div class="brand__name">智慧保險平台</div>
    </div>

    <!-- Menu -->
    <q-list padding>
      <q-item
        clickable
        to="/recommend"
        exact
        :active="route.path === '/recommend'"
        active-class="menu-active"
      >
        <q-item-section avatar>
          <q-icon name="auto_awesome" />
        </q-item-section>

        <q-item-section> 智慧推薦 </q-item-section>
      </q-item>

      <q-item clickable to="/premium-calculator" exact :active="route.path === '/premium-calculator'"
        active-class="menu-active">
        <q-item-section avatar>
          <q-icon name="calculate" />
        </q-item-section>

        <q-item-section> 保費試算 </q-item-section>
      </q-item>

      <q-item clickable to="/plan-admin" exact :active="route.path === '/plan-admin'" active-class="menu-active">
        <q-item-section avatar>
          <q-icon name="assignment" />
        </q-item-section>

        <q-item-section> 保險方案管理 </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>
/* ===== Sidebar 主體（改成 tokens） ===== */
.sidebar {
  height: 100%;
  background: var(--dark-green, #007a3d);
  color: var(--white, #ffffff);
}

/* ===== Logo 區 ===== */
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

/* ===== Quasar Item ===== */
:deep(.q-item) {
  border-radius: 10px;
  margin: 4px 8px;

  color: rgba(255, 255, 255, 0.75);
  transition: all 0.2s ease;
}

/* hover */
:deep(.q-item:hover) {
  background: var(--primary-color, #05994d);
  color: var(--white, #ffffff);
}

/* active（目前選中） */
:deep(.menu-active) {
  background: var(--primary-color, #05994d);
  color: var(--white, #ffffff);
  font-weight: 600;
}

/* icon 顏色同步 */
:deep(.q-item .q-icon) {
  color: inherit;
}
</style>
