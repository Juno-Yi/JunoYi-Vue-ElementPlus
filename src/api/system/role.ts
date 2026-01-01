import request from '@/utils/http'
import type { PageResult } from '@/types/common/response'

/**
 * 获取角色列表（分页）
 */
export function fetchRoleList(params?: Api.System.RoleQueryDTO) {
  return request.get<PageResult<Api.System.RoleVO>>({
    url: '/system/role',
    params
  })
}

/**
 * 获取角色详情
 */
export function fetchRoleById(id: number | string) {
  return request.get<Api.System.RoleVO>({
    url: `/system/role/${id}`
  })
}

/**
 * 添加角色
 */
export function addRole(data: Api.System.RoleDTO) {
  return request.post<number>({
    url: '/system/role',
    data,
    showSuccessMessage: true
  })
}

/**
 * 更新角色
 */
export function updateRole(data: Api.System.RoleDTO) {
  return request.put<void>({
    url: '/system/role',
    data,
    showSuccessMessage: true
  })
}

/**
 * 删除角色
 */
export function deleteRole(id: number | string) {
  return request.del<void>({
    url: `/system/role/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 更新角色状态
 */
export function updateRoleStatus(id: number, status: number) {
  return request.put<void>({
    url: `/system/role/${id}/status`,
    data: { status },
    showSuccessMessage: true
  })
}
