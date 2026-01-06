/**
 * 会话监控相关类型定义
 */
declare namespace Api.System {
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
    /** 登录IP */
    loginIp: string
    /** 登录地点 */
    loginLocation?: string
    /** 登录平台：admin-管理后台, web-前台, miniapp-小程序, app-APP, desktop-桌面端 */
    platform: 'admin' | 'web' | 'miniapp' | 'app' | 'desktop'
    /** 浏览器 */
    browser?: string
    /** 操作系统 */
    os?: string
    /** 设备类型 */
    deviceType?: string
    /** 登录时间 */
    loginTime: string
    /** 最后访问时间 */
    lastAccessTime: string
    /** 会话过期时间 */
    expireTime: string
    /** 会话状态：1-在线, 0-离线 */
    status: number
  }

  /** 会话查询参数 */
  interface SessionQueryDTO {
    /** 用户名 */
    userName?: string
    /** 登录IP */
    loginIp?: string
    /** 登录平台 */
    platform?: string
    /** 当前页 */
    pageNum?: number
    /** 每页条数 */
    pageSize?: number
  }
}
