interface UpgradeLog {
  version: string // 版本号
  title: string // 更新标题
  date: string // 更新日期
  detail?: string[] // 更新内容
  requireReLogin?: boolean // 是否需要重新登录
  remark?: string // 备注
}

export const upgradeLogList = ref<UpgradeLog[]>([
  {
    version: 'v1.0.0',
    title: '正式版本发布',
    date: '2025-06-06',
    detail: [
      '全局 TypeScript 类型体系重构，提升类型准确性与可维护性',
      '重构 utils 工具包，统一工具方法结构，增强可读性与复用性',
      'utils 新增表单验证与 Cookie 操作相关工具函数',
      '删除未使用的工具模块与无效资源，精简项目体积',
      '优化 views 页面结构，移除冗余页面文件',
      '页面组件增加 defineOptions，明确组件命名',
      '异常页面多语言支持, 提升国际化体验',
      '图片资源统一转换为 webp 格式，整体资源体积减少约 50%',
      '打包产物减少约 1MB，提高加载效率',
      'HTTP 请求增加 token 过期自动处理逻辑，提升安全性与用户体验'
    ],
    requireReLogin: false
  }
])
