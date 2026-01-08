import request from '@/utils/http'
import type { PageResult } from '@/types/common/response'

// ==================== 权限池 API ====================

/**
 * 获取权限池列表（分页）
 */
export function fetchGetPermissionPoolList(params?: Api.System.PermissionPoolQueryDTO) {
  return request.get<PageResult<Api.System.PermissionPoolVO>>({
    url: '/system/permission-pool/list',
    params
  })
}

/**
 * 获取权限池下拉选项
 */
export function fetchGetPermissionPoolOptions() {
  return request.get<Api.System.PermissionPoolVO[]>({
    url: '/system/permission-pool/options'
  })
}

/**
 * 添加权限
 */
export function fetchAddPermissionPool(data: Api.System.PermissionPoolDTO) {
  return request.post<void>({
    url: '/system/permission-pool',
    data,
    showSuccessMessage: true
  })
}

/**
 * 删除权限
 */
export function fetchDeletePermissionPool(id: number) {
  return request.del<void>({
    url: `/system/permission-pool/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 批量删除权限
 */
export function fetchDeletePermissionPoolBatch(ids: number[]) {
  return request.del<void>({
    url: '/system/permission-pool/batch',
    data: ids,
    showSuccessMessage: true
  })
}

// ==================== 权限组 API ====================

/**
 * 获取权限组列表（分页）
 */
export function fetchGetPermissionGroupList(params?: Api.System.PermissionGroupQueryDTO) {
  return request.get<PageResult<Api.System.PermissionGroupVO>>({
    url: '/system/permission/list',
    params
  })
}

/**
 * 获取权限组详情
 */
export function fetchGetPermissionGroupById(id: number) {
  return request.get<Api.System.PermissionGroupVO>({
    url: `/system/permission/${id}`
  })
}

/**
 * 获取所有权限组（下拉选项用）
 */
export function fetchGetPermissionGroupOptions() {
  return request.get<Api.System.PermissionGroupVO[]>({
    url: '/system/permission/options'
  })
}

/**
 * 添加权限组
 */
export function fetchAddPermissionGroup(data: Api.System.PermissionGroupDTO) {
  return request.post<void>({
    url: '/system/permission',
    data,
    showSuccessMessage: true
  })
}

/**
 * 更新权限组
 */
export function fetchUpdatePermissionGroup(data: Api.System.PermissionGroupDTO) {
  return request.put<void>({
    url: '/system/permission',
    data,
    showSuccessMessage: true
  })
}

/**
 * 删除权限组
 */
export function fetchDeletePermissionGroup(id: number) {
  return request.del<void>({
    url: `/system/permission/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 批量删除权限组
 */
export function fetchDeletePermissionGroupBatch(ids: number[]) {
  return request.del<void>({
    url: '/system/permission/batch',
    data: ids,
    showSuccessMessage: true
  })
}
