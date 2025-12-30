import request from '@/utils/http'

/**
 * 获取菜单树形列表
 */
export function fetchMenuTree(params?: Api.System.MenuQueryDTO) {
  return request.get<Api.System.MenuVO[]>({
    url: '/system/menu/tree',
    params
  })
}

/**
 * 添加菜单
 */
export function addMenu(params: Api.System.MenuDTO) {
  return request.post<void>({
    url: '/system/menu',
    params,
    showSuccessMessage: true
  })
}

/**
 * 更新菜单
 */
export function updateMenu(params: Api.System.MenuDTO) {
  return request.put<void>({
    url: '/system/menu',
    params,
    showSuccessMessage: true
  });
}

/**
 * 删除菜单
 */
export function deleteMenu(id: number | string){
  return request.del<void>({
    url: '/system/menu/' + id,
    showSuccessMessage: true
  })
}

