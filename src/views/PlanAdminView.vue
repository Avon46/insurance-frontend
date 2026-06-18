<template>
  <q-page class="placeholder-page">
    <div class="placeholder-card">
      <div class="placeholder-card__icon">
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="6" y="8" width="36" height="32" rx="4" stroke="currentColor" stroke-width="2.2" />
          <path d="M6 18h36" stroke="currentColor" stroke-width="2.2" />
          <path d="M16 8v10M32 8v10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          <path d="M14 27h8M14 33h5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          <path d="M30 26l3 3 5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1 class="placeholder-card__title">保險方案管理</h1>
      <p class="placeholder-card__desc">
        此模組由 <strong>劉昕雨</strong> 負責開發，功能包含保單 CRUD 管理、QTable 列表與分類篩選。
      </p>
      <div class="placeholder-card__specs">
        <div class="spec-item">
          <span class="spec-item__label">API</span>
          <code>GET / POST / PUT / DELETE /api/v1/plans</code>
        </div>
        <div class="spec-item">
          <span class="spec-item__label">功能</span>
          <span>新增、編輯、刪除保單；依分類即時篩選</span>
        </div>
        <div class="spec-item">
          <span class="spec-item__label">UI 元件</span>
          <span>QTable、二次確認刪除彈窗</span>
        </div>
      </div>
      <span class="placeholder-card__badge">開發中</span>
    </div>
  </q-page>
</template>

<style scoped>
.placeholder-page {
  min-height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.placeholder-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 48px 40px;
  max-width: 520px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.placeholder-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: var(--light-green);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-card__icon svg {
  width: 36px;
  height: 36px;
}

.placeholder-card__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--dark-green);
}

.placeholder-card__desc {
  margin: 0;
  font-size: 14.5px;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 380px;
}

.placeholder-card__specs {
  width: 100%;
  background: var(--light-green);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  margin-top: 4px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spec-item__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.spec-item code,
.spec-item span:not(.spec-item__label) {
  font-size: 13px;
  color: var(--text-main);
  line-height: 1.5;
}

.placeholder-card__badge {
  display: inline-flex;
  align-items: center;
  background: #fff3cd;
  color: #7d5f00;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
</style>
