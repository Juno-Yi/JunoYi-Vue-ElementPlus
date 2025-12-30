/**
 * v-permission 权限指令
 *
 * 基于用户权限标识控制 DOM 元素的显示和隐藏。
 * 从用户 store 的 permissions 数组中获取权限列表进行判断。
 *
 * ## 主要功能
 *
 * - 权限验证 - 根据用户 permissions 列表验证权限
 * - 通配符支持 - `*` 表示超级管理员拥有所有权限
 * - 前缀通配符 - `system.ui.*` 表示拥有 system.ui 下所有权限
 * - 黑名单权限 - 以 `-` 开头表示禁止该权限（优先级最高）
 * - DOM 控制 - 无权限时自动移除元素
 *
 * ## 使用示例
 *
 * ```vue
 * <!-- 检查是否有 system.menu.add 权限 -->
 * <el-button v-permission="'system.menu.add'">新增</el-button>
 *
 * <!-- 检查是否有 system.menu.edit 权限 -->
 * <el-button v-permission="'system.menu.edit'">编辑</el-button>
 *
 * <!-- 检查是否有 system.menu.delete 权限 -->
 * <el-button v-permission="'system.menu.delete'">删除</el-button>
 * ```
 *
 * ## 权限规则
 *
 * 用户 permissions 数组示例：
 * - `['*']` - 超级管理员，拥有所有权限
 * - `['system.*']` - 拥有 system 模块下所有权限
 * - `['system.menu.*']` - 拥有 system.menu 下所有权限
 * - `['system.menu.add', 'system.menu.edit']` - 拥有指定权限
 * - `['-system.menu.delete']` - 黑名单，禁止 delete 权限（优先级最高）
 *
 * @module directives/permission
 * @author Fan
 */

import { useUserStore } from '@/store/modules/user'
import { App, Directive, DirectiveBinding } from 'vue'

interface PermissionBinding extends DirectiveBinding {
  value: string | string[]
}

/**
 * 检查用户是否拥有指定权限
 * @param requiredPermission 需要的权限标识
 * @param userPermissions 用户拥有的权限列表
 * @returns 是否有权限
 */
function hasPermission(requiredPermission: string, userPermissions: string[]): boolean {
  if (!requiredPermission || !userPermissions?.length) {
    return false
  }

  // 检查黑名单（优先级最高）
  const blacklistPermission = `-${requiredPermission}`
  if (userPermissions.includes(blacklistPermission)) {
    return false
  }

  // 检查黑名单通配符（如 -system.menu.* 会禁止 system.menu 下所有权限）
  for (const perm of userPermissions) {
    if (perm.startsWith('-') && perm.endsWith('*')) {
      const blacklistPrefix = perm.slice(1, -1) // 去掉 - 和 *
      if (requiredPermission.startsWith(blacklistPrefix)) {
        return false
      }
    }
  }

  // 检查超级管理员通配符
  if (userPermissions.includes('*')) {
    return true
  }

  // 检查精确匹配
  if (userPermissions.includes(requiredPermission)) {
    return true
  }

  // 检查前缀通配符匹配
  // 例如用户有 system.menu.*，检查 system.menu.add 是否匹配
  const permissionParts = requiredPermission.split('.')
  for (let i = permissionParts.length - 1; i >= 0; i--) {
    const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*'
    if (userPermissions.includes(wildcardPermission)) {
      return true
    }
  }

  // 检查更高层级的通配符
  // 例如用户有 system.*，检查 system.menu.add 是否匹配
  for (const perm of userPermissions) {
    if (perm.endsWith('*')) {
      const prefix = perm.slice(0, -1) // 去掉 *
      if (requiredPermission.startsWith(prefix)) {
        return true
      }
    }
  }

  return false
}

/**
 * 检查权限并控制元素显示
 */
function checkPermission(el: HTMLElement, binding: PermissionBinding): void {
  const userStore = useUserStore()
  const userPermissions = userStore.info?.permissions || []

  // 支持单个权限或权限数组
  const requiredPermissions = Array.isArray(binding.value) ? binding.value : [binding.value]

  // 检查是否拥有任一权限（OR 逻辑）
  const hasAnyPermission = requiredPermissions.some((perm) =>
    hasPermission(perm, userPermissions)
  )

  // 如果没有权限，移除元素
  if (!hasAnyPermission) {
    removeElement(el)
  }
}

/**
 * 移除 DOM 元素
 */
function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const permissionDirective: Directive = {
  mounted: checkPermission,
  updated: checkPermission
}

/**
 * 注册 v-permission 指令
 */
export function setupPermissionDirective(app: App): void {
  app.directive('permission', permissionDirective)
}

/**
 * 导出权限检查函数，供编程式使用
 */
export { hasPermission }
