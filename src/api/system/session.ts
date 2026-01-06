import request from '@/utils/http'
import type { PageResult } from '@/types/common/response'

/**
 * 获取会话列表（分页）
 */
export function fetchGetSessionList(params?: Api.System.SessionQueryDTO) {
  return request.get<PageResult<Api.System.SessionVO>>({
    url: '/system/session',
    params
  })
}

/**
 * 强制下线
 */
export function fetchForceLogout(sessionId: string) {
  return request.del<void>({
    url: `/system/session/${sessionId}`,
    showSuccessMessage: true
  })
}

/**
 * 批量强制下线
 */
export function fetchBatchForceLogout(sessionIds: string[]) {
  return request.del<void>({
    url: '/system/session/batch',
    data: sessionIds,
    showSuccessMessage: true
  })
}
