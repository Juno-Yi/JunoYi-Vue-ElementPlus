import http from '@/utils/http'

/**
 * 系统设置接口
 */

export interface SysSetting {
    settingId?: number
    settingKey: string
    settingValue: string
    settingName: string
    settingType: string
    settingGroup: string
    sort?: number
    isSystem?: number
    status?: number
    remark?: string
}

/**
 * 获取所有系统设置
 */
export function fetchGetAllConfigs() {
    return http.get<SysSetting[]>({
        url: '/system/setting/list'
    })
}

/**
 * 根据分组获取系统设置
 */
export function fetchGetConfigsByGroup(group: string) {
    return http.get<SysSetting[]>({
        url: `/system/setting/group/${group}`
    })
}

/**
 * 根据键名获取设置值
 */
export function fetchGetConfigValue(key: string) {
    return http.get<string>({
        url: `/system/setting/value/${key}`
    })
}

/**
 * 获取所有设置（Map形式）
 */
export function fetchGetAllConfigsMap() {
    return http.get<Record<string, string>>({
        url: '/system/setting/map'
    })
}

/**
 * 更新设置值
 */
export function fetchUpdateConfigValue(key: string, value: string) {
    return http.put<void>({
        url: `/system/setting/update?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`,
    })
}

/**
 * 批量更新设置值
 */
export function fetchBatchUpdateConfigs(settings: Record<string, string>) {
    return http.put<void>({
        url: '/system/setting/batch',
        data: settings,
    })
}

/**
 * 添加设置
 */
export function fetchAddConfig(setting: SysSetting) {
    return http.post<void>({
        url: '/system/setting/add',
        data: setting,
    })
}

/**
 * 删除设置
 */
export function fetchDeleteConfig(key: string) {
    return http.del<void>({
        url: `/system/setting/delete/${key}`,
    })
}

/**
 * 刷新设置缓存
 */
export function fetchRefreshConfigCache() {
    return http.post<void>({
        url: '/system/setting/refresh',
    })
}
