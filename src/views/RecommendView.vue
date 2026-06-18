<template>
  <div class="placeholder-page">
    <div class="placeholder-card">
      <div class="placeholder-card__icon">
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="10" stroke="currentColor" stroke-width="2.2" />
          <path d="M24 6v4M24 38v4M6 24h4M38 24h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          <path d="M11.3 11.3l2.8 2.8M33.9 33.9l2.8 2.8M11.3 36.7l2.8-2.8M33.9 14.1l2.8-2.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        </svg>
      </div>
      <h1 class="placeholder-card__title">智慧推薦</h1>
      <p class="placeholder-card__desc">
        此模組由 <strong>鄭予晴</strong> 負責開發，根據預算與險種需求推薦 Top 3 最適合的保單，並支援橫向比較與 Chart.js 視覺化。
      </p>
      <div class="placeholder-card__specs">
        <div class="spec-item">
          <span class="spec-item__label">API</span>
          <code>POST /api/v1/recommend</code>
        </div>
        <div class="spec-item">
          <span class="spec-item__label">輸入</span>
          <span>預算上限、主要需求（醫療 / 意外 / 壽險）</span>
        </div>
        <div class="spec-item">
          <span class="spec-item__label">輸出</span>
          <span>Top 3 推薦保單 + Matching Score + 橫向比較 + Chart.js 雷達圖</span>
        </div>
        <div class="spec-item">
          <span class="spec-item__label">加分功能</span>
          <span>收藏對比、風險評分（1~100）</span>
        </div>
      </div>
      <span class="placeholder-card__badge">開發中</span>
    </div>
  </div>
</template>

<style scoped>
.placeholder-page {
  min-height: 100vh;
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
