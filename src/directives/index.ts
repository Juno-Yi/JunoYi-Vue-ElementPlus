import type { App } from 'vue'
import { setupAuthDirective } from './core/auth'
import { setupPermissionDirective } from './core/permission'
import { setupHighlightDirective } from './business/highlight'
import { setupRippleDirective } from './business/ripple'
import { setupRolesDirective } from './core/roles'

export function setupGlobDirectives(app: App) {
  setupAuthDirective(app) // 权限指令（旧版，基于路由 meta.authList）
  setupPermissionDirective(app) // 权限指令（新版，基于用户 permissions）
  setupRolesDirective(app) // 角色权限指令
  setupHighlightDirective(app) // 高亮指令
  setupRippleDirective(app) // 水波纹指令
}
