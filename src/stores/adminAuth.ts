import { defineStore } from 'pinia'
import { ref } from 'vue'

// ─────────────────────────────────────────────────────────
// 管理員登入狀態（Pinia）
//
// 注意：後端 JWT 驗證尚未實作（見後端 InsurancePlanController 的 TODO），
// 本階段為「純前端 Route Guard」，僅控制畫面進入權限，不具備真正的安全性。
// 待後端串接 JWT 後，這裡應改為保存 token 並於登入時呼叫後端驗證。
// ─────────────────────────────────────────────────────────

/** 暫時的前端寫死帳密；後端 JWT 完成後移除 */
const DEMO_ADMIN_USERNAME = 'admin'
const DEMO_ADMIN_PASSWORD = 'admin123'

const STORAGE_KEY = 'insurance-admin-auth'

export const useAdminAuthStore = defineStore('adminAuth', () => {
  // 重新整理後仍維持登入狀態
  const isAuthenticated = ref<boolean>(sessionStorage.getItem(STORAGE_KEY) === '1')

  /**
   * 嘗試登入。成功回傳 true，失敗回傳 false。
   * @returns 是否登入成功
   */
  function login(username: string, password: string): boolean {
    const ok = username === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD
    if (ok) {
      isAuthenticated.value = true
      sessionStorage.setItem(STORAGE_KEY, '1')
    }
    return ok
  }

  function logout(): void {
    isAuthenticated.value = false
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { isAuthenticated, login, logout }
})
