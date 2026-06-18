<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isExpanded = ref(true)
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': !isExpanded }">
    <!-- 品牌標題 -->
    <div class="sidebar__brand">
      <div class="brand__mark">保</div>
      <span class="brand__name">智慧保險平台</span>
    </div>

    <!-- 導覽選單 -->
    <nav class="sidebar__nav" aria-label="主選單">
      <!-- 保費試算 -->
      <router-link to="/premium-calculator" class="nav-item"
        :class="{ 'nav-item--active': route.path === '/premium-calculator' }" :title="!isExpanded ? '保費試算' : undefined">
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.7" />
          <path d="M7 8h4M7 12h4M7 16h4M14 12h3M14 16h3" stroke="currentColor" stroke-width="1.7"
            stroke-linecap="round" />
          <rect x="14" y="7" width="3" height="2.5" rx="0.5" fill="currentColor" />
        </svg>
        <span class="nav-item__label">保費試算</span>
      </router-link>

      <!-- 保險方案管理 -->
      <router-link to="/plan-admin" class="nav-item" :class="{ 'nav-item--active': route.path === '/plan-admin' }"
        :title="!isExpanded ? '保險方案管理' : undefined">
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.7" />
          <path d="M3 9h18" stroke="currentColor" stroke-width="1.7" />
          <path d="M8 4V9M16 4V9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          <path d="M7 13h4M7 16.5h2.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          <path d="M15 13l1.5 1.5L19 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        <span class="nav-item__label">保險方案管理</span>
        <span class="nav-item__badge">開發中</span>
      </router-link>

      <!-- 智慧推薦 -->
      <router-link to="/recommend" class="nav-item" :class="{ 'nav-item--active': route.path === '/recommend' }"
        :title="!isExpanded ? '智慧推薦' : undefined">
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M16.9 16.9l1.5 1.5M5.6 18.4l1.4-1.4M16.9 7.1l1.5-1.5"
            stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
        </svg>
        <span class="nav-item__label">智慧推薦</span>
        <span class="nav-item__badge">開發中</span>
      </router-link>
    </nav>

    <!-- 收合按鈕 -->
    <button class="sidebar__toggle" :aria-label="isExpanded ? '收合側欄' : '展開側欄'" @click="isExpanded = !isExpanded">
      <svg class="toggle__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"
        :style="{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
      <span class="toggle__label">收合</span>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: var(--dark-green);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease;
  overflow: hidden;
  position: sticky;
  top: 0;
  align-self: flex-start;
}

.sidebar--collapsed {
  width: 60px;
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
  transition: opacity 0.2s ease;
}

.sidebar--collapsed .brand__name {
  opacity: 0;
  pointer-events: none;
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
  position: relative;
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
  transition: opacity 0.2s ease;
  flex: 1;
  min-width: 0;
}

.sidebar--collapsed .nav-item__label {
  opacity: 0;
  pointer-events: none;
}

.nav-item__badge {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.12);
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: 0.02em;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.sidebar--collapsed .nav-item__badge {
  opacity: 0;
  pointer-events: none;
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

.toggle__label {
  transition: opacity 0.2s ease;
}

.sidebar--collapsed .toggle__label {
  opacity: 0;
  pointer-events: none;
}
</style>
