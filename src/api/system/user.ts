import request from '@/utils/http'
import { PageResult } from '@/types'

/**
 * 获取用户列表（分页）
 */
export function fetchGetUserList(params: Api.System.UserQueryDTO) {
  return request.get<PageResult<Api.System.SysUserVO>>({
    url: '/system/user',
    params
  })
}

/**
 * 添加用户
 */
export function fetchAddUser(data: Api.System.SysUserDTO) {
  return request.post<void>({
    url: '/system/user',
    data,
    showSuccessMessage: true
  })
}

/**
 * 更新用户
 */
export function fetchUpdateUser(data: Api.System.SysUserDTO) {
  return request.put<void>({
    url: '/system/user',
    data,
    showSuccessMessage: true
  })
}
