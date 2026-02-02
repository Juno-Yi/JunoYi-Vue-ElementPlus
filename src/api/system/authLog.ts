import request from '@/utils/http'
import type { PageResult } from '@/types/common/response'

/**
 * 获取登录日志列表
 */
export function fetchGetLoginLogList(params?: Api.System.AuthLogQueryDTO) {
    return request.get<PageResult<Api.System.AuthLogVO>>({
        url: '/system/loginLog/list',
        params
    })
}

/**
 * 删除登录日志
 */
export function fetchDeleteLoginLog(ids: number[]) {
    return request.del<void>({
        url: `/system/loginLog/${ids.join(',')}`,
        showSuccessMessage: true
    })
}

/**
 * 清空登录日志
 */
export function fetchClearLoginLog() {
    return request.del<void>({
        url: '/system/loginLog/clear',
        showSuccessMessage: true
    })
}
