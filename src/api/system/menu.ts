import request from '@/utils/http'
import type { PageResult } from '@/types/common/response'

/**
 * 获取菜单树形列表（不分页）
 */
export function fetchMenuTree(params?: Api.System.MenuQueryDTO) {
  return request.get<Api.System.MenuVO[]>({
    url: '/system/menu/tree',
    params
  })
}

/**
 * 获取菜单列表（分页）
 */
export function fetchMenuList(params?: Api.System.MenuQueryDTO) {
  return request.get<PageResult<Api.System.MenuVO>>({
    url: '/system/menu/list',
    params
  })
}

/**
 * 获取菜单详情
 */
export function fetchMenuById(id: number | string) {
  return request.get<Api.System.MenuVO>({
    url: `/system/menu/${id}`
  })
}

/**
 * 添加菜单
 */
export function addMenu(data: Api.System.MenuDTO) {
  return request.post<number>({
    url: '/system/menu',
    data,
    showSuccessMessage: true
  })
}

/**
 * 更新菜单
 */
export function updateMenu(data: Api.System.MenuDTO) {
  return request.put<void>({
    url: '/system/menu',
    data,
    showSuccessMessage: true
  })
}

/**
 * 删除菜单
 */
export function deleteMenu(id: number | string) {
  return request.del<void>({
    url: `/system/menu/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 批量删除菜单
 */
export function deleteMenuBatch(ids: (number | string)[]) {
  return request.del<void>({
    url: '/system/menu/batch',
    data: ids,
    showSuccessMessage: true
  })
}

