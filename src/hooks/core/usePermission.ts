/**
 * usePermission - 权限验证 Hook
 *
 * 提供简洁的权限检查功能，基于用户 permissions 列表验证权限
 *
 * ## 使用示例
 *
 * ```typescript
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()
 *
 * // 检查单个权限
 * if (hasPermission('system.menu.add')) {
 *   // 显示新增按钮
 * }
 *
 * // 检查是否有任一权限
 * if (hasAnyPermission(['system.menu.add', 'system.menu.edit'])) {
 *   // 显示操作区域
 * }
 *
 * // 检查是否有所有权限
 * if (hasAllPermissions(['system.menu.add', 'system.menu.edit'])) {
 *   // 显示高级操作
 * }
 *
 * // 在模板中使用
 * <el-button v-if="hasPermission('system.menu.edit')">编辑</el-button>
 * ```
 *
 * ## 权限规则
 *
 * - `*` - 超级管理员，拥有所有权限
 * - `system.*` - 拥有 system 模块下所有权限
 * - `system.menu.*` - 拥有 system.menu 下所有权限
 * - `-system.menu.delete` - 黑名单，禁止该权限（优先级最高）
 *
 * @module hooks/usePermission
 * @author Fan
 */

import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * 检查用户是否拥有指定权限
 * @param requiredPermission 需要的权限标识
 * @param userPermissions 用户拥有的权限列表
 * @returns 是否有权限
 */
function checkPermission(requiredPermission: string, userPermissions: string[]): boolean {
  if (!requiredPermission || !userPermissions?.length) {
    return false
  }

  // 检查黑名单（优先级最高）
  const blacklistPermission = `-${requiredPermission}`
  if (userPermissions.includes(blacklistPermission)) {
    return false
  }

  // 检查黑名单通配符
  for (const perm of userPermissions) {
    if (perm.startsWith('-') && perm.endsWith('*')) {
      const blacklistPrefix = perm.slice(1, -1)
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
  const permissionParts = requiredPermission.split('.')
  for (let i = permissionParts.length - 1; i >= 0; i--) {
    const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*'
    if (userPermissions.includes(wildcardPermission)) {
      return true
    }
  }

  // 检查更高层级的通配符
  for (const perm of userPermissions) {
    if (perm.endsWith('*')) {
      const prefix = perm.slice(0, -1)
      if (requiredPermission.startsWith(prefix)) {
        return true
      }
    }
  }

  return false
}

/**
 * 权限验证 Hook
 */
export function usePermission() {
  const userStore = useUserStore()

  // 用户权限列表
  const permissions = computed(() => userStore.info?.permissions || [])

  /**
   * 检查是否有指定权限
   * @param permission 权限标识
   */
  const hasPermission = (permission: string): boolean => {
    return checkPermission(permission, permissions.value)
  }

  /**
   * 检查是否有任一权限（OR 逻辑）
   * @param permissionList 权限标识列表
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some((perm) => checkPermission(perm, permissions.value))
  }

  /**
   * 检查是否有所有权限（AND 逻辑）
   * @param permissionList 权限标识列表
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every((perm) => checkPermission(perm, permissions.value))
  }

  /**
   * 检查是否是超级管理员
   */
  const isSuperAdmin = computed(() => permissions.value.includes('*'))

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin
  }
}

// 导出检查函数供指令使用
export { checkPermission }
