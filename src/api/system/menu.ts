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
