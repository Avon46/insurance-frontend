<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{ mini: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const route = useRoute()
</script>

<template>
  <div class="sidebar-content">
    <!-- 品牌標題 -->
    <div class="sidebar__brand">
      <div class="brand__mark">保</div>
      <span class="brand__name q-mini-drawer-hide">智慧保險平台</span>
    </div>

    <!-- 導覽選單 -->
    <nav class="sidebar__nav" aria-label="主選單">
      <!-- 保險方案管理 -->
      <router-link
        to="/plan-admin"
        class="nav-item"
        :class="{ 'nav-item--active': route.path === '/plan-admin' }"
        title="保險方案管理"
      >
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.7" />
          <path d="M3 9h18" stroke="currentColor" stroke-width="1.7" />
          <path d="M8 4V9M16 4V9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          <path d="M7 13h4M7 16.5h2.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          <path d="M15 13l1.5 1.5L19 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="nav-item__label q-mini-drawer-hide">保險方案管理</span>
        <span class="nav-item__badge q-mini-drawer-hide">開發中</span>
      </router-link>

      <!-- 保費試算 -->
      <router-link
        to="/premium-calculator"
        class="nav-item"
        :class="{ 'nav-item--active': route.path === '/premium-calculator' }"
        title="保費試算"
      >
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.7" />
          <path d="M7 8h4M7 12h4M7 16h4M14 12h3M14 16h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          <rect x="14" y="7" width="3" height="2.5" rx="0.5" fill="currentColor" />
        </svg>
        <span class="nav-item__label q-mini-drawer-hide">保費試算</span>
      </router-link>

      <!-- 智慧推薦 -->
      <router-link
        to="/recommend"
        class="nav-item"
        :class="{ 'nav-item--active': route.path === '/recommend' }"
        title="智慧推薦"
      >
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M16.9 16.9l1.5 1.5M5.6 18.4l1.4-1.4M16.9 7.1l1.5-1.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
        </svg>
        <span class="nav-item__label q-mini-drawer-hide">智慧推薦</span>
        <span class="nav-item__badge q-mini-drawer-hide">開發中</span>
      </router-link>
    </nav>

    <!-- 收合按鈕 -->
    <button
      class="sidebar__toggle"
      :aria-label="mini ? '展開側欄' : '收合側欄'"
      @click="emit('toggle')"
    >
      <svg
        class="toggle__icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        :style="{ transform: mini ? 'rotate(180deg)' : 'rotate(0deg)' }"
      >
        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="toggle__label q-mini-drawer-hide">收合</span>
    </button>
  </div>
</template>

<style scoped>
.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 品牌區塊 */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  white-space: nowrap;
  overflow: hidden;
}

.brand__mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand__name {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.03em;
}

/* 導覽選單 */
.sidebar__nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
  overflow: hidden;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item--active {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.nav-item__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-item__label {
  flex: 1;
  min-width: 0;
}

.nav-item__badge {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.12);
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

/* 收合按鈕 */
.sidebar__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 10px;
  margin: 8px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar__toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.toggle__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}
</style>
