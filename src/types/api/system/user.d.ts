/**
 * 系统用户相关类型定义
 */
declare namespace Api.System {
  /**
   * 用户查询参数
   */
  interface UserQueryDTO {
    /** 部门ID */
    deptId?: number
    /** 用户名 */
    userName?: string
    /** 昵称 */
    nickName?: string
    /** 邮箱 */
    email?: string
    /** 手机号 */
    phonenumber?: string
    /** 性别 */
    sex?: string
    /** 状态 */
    status?: number
    /** 当前页 */
    current?: number
    /** 每页条数 */
    size?: number
  }

  /**
   * 用户视图对象
   */
  interface SysUserVO {
    /** 用户ID */
    id: number
    /** 部门ID */
    deptId?: number
    /** 用户名 */
    userName: string
    /** 昵称 */
    nickName?: string
    /** 邮箱 */
    email?: string
    /** 手机号 */
    phonenumber?: string
    /** 性别 */
    sex?: string
    /** 头像 */
    avatar?: string
    /** 状态 1-启用 0-禁用 */
    status: number
    /** 创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
    /** 备注 */
    remark?: string
  }
}
