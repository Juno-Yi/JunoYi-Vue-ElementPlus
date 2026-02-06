/**
 * 系统参数配置相关类型定义
 */
declare namespace Api.System {
  /**
   * 系统参数查询参数
   */
  interface ConfigQueryDTO {
    /** 参数名称 */
    settingName?: string
    /** 参数键名 */
    settingKey?: string
    /** 参数类型 */
    settingType?: string
    /** 参数分组 */
    settingGroup?: string
    /** 是否系统内置（0否 1是） */
    isSystem?: number
    /** 当前页 */
    current?: number
    /** 每页条数 */
    size?: number
  }

  /**
   * 系统参数VO类型（后端返回格式）
   */
  interface ConfigVO {
    /** 设置ID */
    settingId: number
    /** 设置键名 */
    settingKey: string
    /** 设置键值 */
    settingValue: string
    /** 设置名称 */
    settingName: string
    /** 设置类型（text/number/boolean/json） */
    settingType: string
    /** 设置分组 */
    settingGroup: string
    /** 排序 */
    sort?: number
    /** 是否系统内置（0否 1是） */
    isSystem: number
    /** 状态（0正常 1停用） */
    status?: number
    /** 备注 */
    remark?: string
    /** 创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
  }

  /**
   * 系统参数DTO类型（请求参数）
   */
  interface ConfigDTO {
    /** 设置ID（修改时必填） */
    settingId?: number
    /** 设置键名 */
    settingKey: string
    /** 设置键值 */
    settingValue: string
    /** 设置名称 */
    settingName: string
    /** 设置类型（text/number/boolean/json） */
    settingType: string
    /** 设置分组 */
    settingGroup: string
    /** 排序 */
    sort?: number
    /** 是否系统内置（0否 1是） */
    isSystem?: number
    /** 状态（0正常 1停用） */
    status?: number
    /** 备注 */
    remark?: string
  }
}
