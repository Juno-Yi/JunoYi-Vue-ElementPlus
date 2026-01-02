import request from '@/utils/http'
import {PageResult} from "@/types";

/**
 * 获取用户列表（分页）
 */
export function fetchGetUserList(params: Api.System.UserQueryDTO) {
  return request.get<PageResult<Api.System.SysUserVO>>({
    url: '/system/user',
    params
  })
}
