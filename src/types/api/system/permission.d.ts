/**
 * 权限相关类型定义
 */
declare namespace Api.System {
  // ==================== 权限池 ====================

  /**
   * 权限池查询参数
   */
  interface PermissionPoolQueryDTO {
    /** 权限标识 */
    permission?: string
    /** 权限描述 */
    description?: string
    /** 状态（0禁用 1启用） */
    status?: number
    /** 当前页 */
    current?: number
    /** 每页条数 */
    size?: number
  }

  /**
   * 权限池VO
   */
  interface PermissionPoolVO {
    /** 主键 */
    id: number
    /** 权限标识 */
    permission: string
    /** 权限描述 */
    description?: string
    /** 状态（0禁用 1启用） */
    status: number
    /** 创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
  }

  /**
   * 权限池DTO
   */
  interface PermissionPoolDTO {
    /** 主键（修改时必填） */
    id?: number
    /** 权限标识 */
    permission: string
    /** 权限描述 */
    description?: string
    /** 状态（0禁用 1启用） */
    status?: number
  }

  // ==================== 权限组 ====================

  /**
   * 权限组查询参数
   */
  interface PermissionGroupQueryDTO {
    /** 权限组名称 */
    groupName?: string
    /** 权限组编码 */
    groupCode?: string
    /** 状态 */
    status?: number
    /** 当前页 */
    current?: number
    /** 每页条数 */
    size?: number
  }

  /**
   * 权限组VO
   */
  interface PermissionGroupVO {
    /** 主键 */
    id: number
    /** 权限组编码 */
    groupCode: string
    /** 权限组名称 */
    groupName: string
    /** 父级权限组ID */
    parentId?: number
    /** 父级权限组名称 */
    parentName?: string
    /** 优先级 */
    priority?: number
    /** 权限列表 */
    permissions: string[]
    /** 描述 */
    description?: string
    /** 状态 1正常 0禁用 */
    status: number
    /** 创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
  }

  /**
   * 权限组DTO
   */
  interface PermissionGroupDTO {
    /** 主键（修改时必填） */
    id?: number
    /** 权限组编码 */
    groupCode: string
    /** 权限组名称 */
    groupName: string
    /** 父级权限组ID */
    parentId?: number
    /** 优先级 */
    priority?: number
    /** 权限列表 */
    permissions: string[]
    /** 描述 */
    description?: string
    /** 状态 1正常 0禁用 */
    status?: number
  }
}
