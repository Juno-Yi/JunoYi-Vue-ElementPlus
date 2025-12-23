interface UpgradeLogDetail {
  added?: string[] // 新增
  changed?: string[] // 优化
  fixed?: string[] // 修复
  demo?: string[] // 测试/示例
}

interface UpgradeLog {
  version: string // 版本号
  title: string // 更新标题
  date: string // 更新日期
  detail?: UpgradeLogDetail // 更新内容（分类）
  breakingChange?: boolean // 是否为破坏性更新
  remark?: string // 备注
}

export const upgradeLogList = ref<UpgradeLog[]>([
  {
    version: 'v3.0.1',
    title: 'bug修复、新增功能',
    date: '2025-11-15',
    detail: {
      added: [
        'ArtForm 和 ArtSearchBar 组件的 label 支持自定义渲染函数，可实现带 tooltip 等复杂标签',
        '菜单管理表单关键字段新增 Tooltip 提示，降低用户配置门槛',
        'iconify 新增离线图标加载模式',
        '退出登录新增 redirect 属性，用于重新登录后跳转到对应页面',
        '退出登录重新进入系统保留用户标签页，根据 userId 进行身份识别',
        '双列菜单新增折叠按钮',
        '菜单图标完善',
        '多标签页增加图标',
        'WebSocket 连接'
      ],
      changed: [
        '完善路由配置验证机制，自动检测并提示非一级菜单的路径配置错误',
        '顶部进度条残影优化',
        'vite 预构建优化',
        '圆角、边框统一',
        '锁屏页面重新设计',
        '退出登录菜单提前消失造成的视觉体验不好问题优化'
      ],
      fixed: [
        '路由注册时不存在接口的重复请求问题',
        '一键精简脚本打包失败的问题'
      ]
    }
  },
  {
    version: 'v3.0.0',
    title: 'Sass 重构为 Tailwind CSS，Iconfont 替换为 Iconify，性能，目录结构，文件注释全方位优化',
    date: '2025-11-9',
    breakingChange: true,
    detail: {
      added: [
        '配置管理优化：新增 setting.ts 配置文件，支持一键复制与重置系统默认设置'
      ],
      changed: [
        '样式系统重构：Sass 全面迁移至 Tailwind CSS，提升开发效率与样式一致性',
        '图标方案升级：Iconfont 替换为 Iconify，支持更丰富的图标库与按需加载',
        '构建优化：完整包体积减少 1.3 MB，显著提升加载性能',
        '路由注册重构：全面重构路由注册系统，引入面向对象设计，提高代码的可维护性、可测试性和扩展能力',
        '架构优化：优化目录结构，职责划分更清晰，降低用户学习成本与上手难度',
        '注释优化：统一模块注释规范，完善每一个组件介绍、功能说明与使用示例，降低用户理解成本与上手难度',
        '性能提升：优化核心代码逻辑，提升系统运行效率',
        '设计系统：重构颜色体系，统一 UI 视觉规范，提升界面一致性',
        '菜单优化：细化菜单样式，优化交互体验与视觉呈现',
        '组件重构：重构 ArtTextScroll 组件，提升性能与可维护性',
        '响应式优化：优化 ArtForm、ArtSearchBar 栅格布局，适配多种屏幕尺寸',
        '节日功能增强：礼花配置支持跨日期范围设置与自定义播放次数',
        '依赖更新：升级核心依赖至最新稳定版本'
      ],
      fixed: [
        'ArtForm、ArtSearchBar 自定义组件渲染异常'
      ],
      demo: [
        'ArtForm、ArtSearchBar 新增 render 属性，支持自定义组件渲染',
        'useTable hooks 新增 visible 属性，用于控制列默认是否显示'
      ]
    },
    remark:
      '重要提示：本次升级涉及样式系统（Sass → Tailwind CSS）与图标库（Iconfont → Iconify）的底层重构，属于破坏性更新。建议新项目直接使用 v3.0，旧版本项目不建议升级。'
  },
  {
    version: 'v2.6.1',
    title: 'bug修复、授权页增加主题色切换功能',
    date: '2025-10-19',
    detail: {
      added: [
        '授权页增加主题色切换功能'
      ],
      changed: [
        '升级部分依赖兼容 tailwindcss'
      ],
      fixed: [
        '获取用户信息、获取菜单接口访问无效地址重复调用问题',
        'ElButton circle 模式样式',
        'ElSlect 无法通过键盘选择问题',
        '带参数静态路由跳转登录页面问题',
        '外部链接菜单点击选中状态'
      ]
    }
  },
  {
    version: 'v2.6.0',
    title: '代码优化、bug修复',
    date: '2025-10-16',
    breakingChange: true,
    detail: {
      added: [
        'VsCode 推荐插件相关配置',
        '扩展注册、密码重置页面顶部组件支持'
      ],
      changed: [
        '精简版本菜单数据结构，提升数据一致性',
        '本地开发环境网络请求代理配置',
        'ElTree 组件默认样式',
        'ElDropdown 组件点击触发模式下的交互样式',
        '菜单过滤逻辑',
        '页面切换动画，提升加载速度',
        '暗黑模式文字颜色'
      ],
      fixed: [
        '静态路由自定义首页路径首次访问跳转登录页问题',
        '退出登录时短暂跳转至 500 页的问题',
        'v2.5.9 版本首页路由跳转配置失效问题',
        'v2.5.9 自动导包机制导致的构建异常'
      ]
    }
  },
  {
    version: 'v2.5.9',
    title: '代码优化',
    date: '2025-10-12',
    detail: {
      changed: [
        'views 文件目录、文件名、代码优化',
        'useTable 分页请求字段增加全局配置 tableConfig.ts',
        '路由配置为模块化结构',
        '获取菜单接口使用 apifox mock 数据（需在 .env 中 将 VITE_ACCESS_MODE 设为 backend 模式）'
      ]
    }
  },
  {
    version: 'v2.5.8',
    title: '依赖升级、bug修复',
    date: '2025-09-29',
    detail: {
      changed: [
        'vue、vite、element-plus 等核心库升级',
        'el-tag 样式优化',
        '顶部进度条颜色优化',
        '自定义主题配置优化',
        'ElementPlus 自定义主题问题优化'
      ],
      fixed: [
        '富文本编辑器全屏顶栏层级问题',
        '表格列排序组件文字益处问题',
        '统计卡片条件判断',
        '根路径 / 与 HOME_PAGE_PATH 同为 / 时出现的无限重定向'
      ]
    },
    remark: '由于项目依赖升级，node 版本需要升级到 v20.19.0 或以上'
  }
])
