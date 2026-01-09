/**
 * 会话监控相关类型定义
 */
declare namespace Api.System {
  /** 平台类型枚举 */
  type PlatformType = 'ADMIN_WEB' | 'FRONT_DESK_WEB' | 'MINI_PROGRAM' | 'APP' | 'DESKTOP_APP'

  /** 会话信息 */
  interface SessionVO {
    /** 会话ID */
    sessionId: string
    /** 用户ID */
    userId: number
    /** 用户名 */
    userName: string
    /** 用户昵称 */
    nickName: string
    /** 平台类型 */
    platformType: PlatformType
    /** 用户角色集合 */
    roles: number[]
    /** 权限集合 */
    permissions: string[]
    /** 用户组集合 */
    groups: string[]
    /** 部门集合 */
    depts: number[]
    /** 登录IP */
    loginIp: string
    /** IP所在地区 */
    ipRegion: string | null
    /** 登录时间 */
    loginTime: string
    /** 最后访问时间 */
    lastAccessTime: string
    /** AccessToken 过期时间（时间戳） */
    accessExpireTime: number
    /** RefreshToken 过期时间（时间戳） */
    refreshExpireTime: number
  }

  /** 会话查询参数 */
  interface SessionQueryDTO {
    /** 用户名 */
    userName?: string
    /** 昵称 */
    nickName?: string
    /** 登录IP */
    loginIp?: string
    /** 平台类型 */
    platformType?: PlatformType
  }
}
