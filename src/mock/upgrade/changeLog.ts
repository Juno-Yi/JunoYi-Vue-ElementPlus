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
        version: 'v0.1.3-alpha',
        title: '菜单管理优化',
        date: '2025-12-31',
        detail: {
            added: [
                '后端添加菜单权限控制注解',
                '后端添加菜单排序接口',
                '前端添加菜单拖拽排序功能',
                '前端添加图标选择器组件',
                '添加 RemixIcon 图标数据',
                '添加 MaterialIconTheme 图标数据',
                '添加 RivetIcons 图标数据',
                '添加 StreamlinePlumpColor 图标数据'
            ],
            changed: [
                '移出异常页面目录以及其相关子菜单',
                '重构前端异常页面组件位置并更新类型声明',
                '前端菜单管理目录添加子菜单操作优化',
                '优化菜单拖拽排序功能',
                '优化拖拽树节点组件实现',
                '优化菜单拖拽排序功能逻辑',
                '优化前端添加/修改菜单弹窗表单',
                '优化前端菜单管理UI',
                '重构图标选择器组件结构',
            ],
            fixed: [
                '修复前端菜单管理中修改外链菜单还必须要填路由地址bug',
                '修复菜单删除功能，禁止删除包含子菜单的菜单项',
                '修复菜单拖拽排序时候定位条出现混乱bug',
                '修复菜单管理拖拽模式提示样式不支持主题色更改bug'
            ]
        }
    },
    {
        version: 'v0.1.2-alpha',
        title: '菜单管理',
        date: '2025-12-30',
        detail: {
            added: [
                '添加默认用户权限组',
                '添加默认管理权限组',
                '添加令牌刷新接口到白名单',
                '添加获取用户会话时，进行懒清理机制',
                '添加系统菜单查询接口和数据转换功能',
                '扩展BaseController功能并添加分页支持',
                '新增菜单树形结构查询接口 getMenuTree',
                '新增菜单平铺列表查询接口 getMenuList',
                '添加批量删除菜单功能',
                '添加菜单类型、状态等查询条件支持',
                '添加菜单分页查询功能',
                '添加前端权限指令',
                '添加菜单异常处理机制',

            ],
            changed: [
                '重构删除前端不必要的页面',
                '重构数据库',
                '优化JWT令牌刷新机制',
                '重构菜单API模块结构',
                '实现菜单详情查询、新增、更新、删除功能',
                '完善系统菜单管理功能',
                '优化菜单业务逻辑',
                '重构前端菜单模块类型定义和图标显示',
                '优化菜单搜索功能中的标题匹配逻辑',
                '优化前端菜单管理中时间显示格式',
                '修复后端字段跟数据库表字段不匹配问题',
                '实现前端v-permission 指令支持权限验证、通配符和黑名单功能',
                '优化后端权限组实体结构和查询逻辑',
                '移除前端旧版权限指令并更新组件使用新权限系统',
                '移出不必要的菜单',
                '调整菜单类型定义，废除 "按钮型菜单" 概念',
                '重构权限验证系统',
                '完善菜单管理API接口和类型定义',
                '优化菜单管理',
                '完善优化基础菜单管理功能',

            ],
            fixed: [
                '修复前端不自动刷新accessToken bug',
                '修复欢迎信息显示问题',
                '修复后端refreshToken刷新时候一直保留旧的，并且永远不会失效bug',
                '修复refreshToken过期，redis依旧存在用户会话对应的 tokenId bug',
                '修复删除菜单时的标题显示问题 (并且支持i18n)',
                '修复前端顶级目录中无子菜单，点击后布局出现bug',

            ],
        },
        remark: '目录本身不是功能，如果目录下没有任何「可见菜单」，那么这个目录就不该显示',
        breakingChange: true
    },
    {
        version: 'v0.1.1-alpha',
        title: '后端菜单数据，前端动态路由',
        date: '2025-12-29',
        detail: {
            added: [
                '添加 sys_menu 数据表',
                '添加 sys_menu_auth 数据表',
                '初始化系统菜单数据并更新表结构',
                '重构VO规范',
                '添加系统路由服务接口和实现',
                '添加系统角色和用户权限相关实体类',
                '添加用户各种相关的数据实体与权限组关联',
                '添加退出登录功能',
                '增加权限组查询的DEBUG日志调试',
                '添加用户独立权限功能',
                '前端添加 Token 刷新机制'
            ],
            changed: [
                '将用户部门ID改为部门列表支持多部门',
                '优化SQL日志输出',
                '实现用户部门关联功能',
                '前端对接退出登录',
                '实现权限组功能并优化数据源配置',
                '更新数据库结构以支持部门权限组关联',
                '实现用户权限查询逻辑',
                '优化用户权限查询逻辑',
                '重构系统路由服务接口和实现',
                '后端更新路由组件数据结构和映射逻辑',
                '后端完成菜单路由接口（根据权限来筛选计算获取菜单路由）',
                '移出数据表sys_menu_auth',
                '移除前端路由模式支持',
                '优化菜单处理逻辑',
                '优化前端菜单排列顺序',
                '删除前端静态路由各种模块',
                '优化前端逻辑',
            ],
            fixed: [
                '修复SQL拦截器没有根据配置属性判断是否启用bug',
                '修复拦截器未读取配置属性 ，现在会根据 sql-beautify-enabled、sql-log-enabled、slow-sql-enabled 配置来决定是否输出日志',
                '修复前端小部分类型错误bug',
            ],

        },
        breakingChange: true,
        remark: '前端部分重构路由机制，路由由后端根据权限计算动态生成'
    },
    {
        version: 'v0.1.0-alpha',
        title: '前端对接登录认证',
        date: '2025-12-27',
        detail: {
            added: [
                '添加定时任务核心封装模块(预留，待完成)',
                '添加集成 MapStruct 对象转换框架',
                '添加验证码异常处理',
                '添加登录接口（兼容全平台账号密码登录方式）',
                '添加刷新token接口',
                '添加退出登录接口',
                '添加获取当前用户登录接口',
                '前端添加验证码接口',
                '添加前端登录页面图像验证码',
                '添加开发环境自动填充登录信息功能',
                'BaseController 中添加安全工具类的导入和用户信息获取方法',
                '后端添加预留用户部门信息',
                '后端添加CORS预检请求处理',

            ],
            changed: [
                '移除 junoyi-common 模块',
                '优化验证逻辑',
                '重构登录认证对象结构',
                '前端添加验证码验证',
                '优化登录登出功能',
                '优化认证控制器',
                '重构前端环境配置',
                '移出前端 Vite 代理设置',
                '重构前端登录页面表单数据类型',
                '重构userInfo获取接口',
                '重构 BaseController 基类',
                '重构前端UserInfo解析',
                '重构前端useAuth.ts',
                '重构前端',
                '重构前端用户权限体系',
                '重构前端用户角色验证机制'
            ],
            fixed: [
                '修复账号密码和验证码正确情况下，第一次请求登录失败，第二次请求登录成功的Bug',
                '修复 maven 依赖循环问题',
                '修复获取userinfo接口',
                '修复后端跨域配置出现不生效的bug',
            ],
            demo: [
                '前端开始接口调通测试',

            ]
        },
        breakingChange: true,
        remark: '当前版本后开始正式前后端对接'
    },
  {
    version: 'v0.0.9-alpha',
    title: '权限机制设计',
    date: '2025-12-26',
    detail: {
      added: [
          '添加访问日志功能',
          '添加权限效果、权限类型、权限逻辑符枚举类',
          '在application.yml中添加permission配置项，支持启用权限控制、缓存设置、超级管理员配置和默认权限组',
          '添加@DataScope注解用于数据范围控制',
          '添加FieldPermission注解用于字段权限控制',
          '添加 sys_permission 系统权限节点数据表',
          '添加 sys_perm_group 系统权限组数据表',
          '添加 sys_group_permission 权限组-权限关联数据表',
          '新增 DataScope 注解用于控制数据行级别访问权限',
          '新增 FieldPermission 注解用于控制字段级别读写权限',
          '新增 Permission 注解用于方法权限校验',
          '新增 DataScopeType 枚举定义数据范围类型',
          '在 LoginUser 类中添加权限节点、权限组、部门ID和超级管理员字段',
          '为超级管理员添加权限验证的快捷路径',
          '添加权限测试接口并更新白名单配置',
          '添加了PermissionException基类',
          '新增NoPermissionException和NotLoginException具体异常类',
          '在全局异常处理器中添加对权限相关异常的专门处理',
          '添加 sys_user_group 表用于用户权限组关联  ',
          '添加 sys_user_perm 表用于用户独立权限管理',
          '添加字段权限序列化',
          '添加数据脱敏工具类',
          '添加字段权限功能支持',
          '新增MaskPattern枚举类定义脱敏模式',
      ],

      changed: [
          '优化访问日志拦截器中的IP获取逻辑',
          '移除旧的 PermissionScope 注解',
          '重构权限系统数据库结构',
          '重构权限上下文管理',
          '移除 PermissionContext 和 PermissionContextHolder 类',
          '修改 PermissionHelper 使用 Supplier 模式获取权限信息',
          '更新 TokenAuthenticationTokenFilter 中的用户会话构建逻辑',
          '扩展会话信息包含权限组和部门信息',
          '优化权限匹配器',
          '实现权限模块异常体系',
          '实现@Permission注解功能',
          '删除了 AccessDeniedException 的全局异常处理方法',
          '优化@Permission，去除PermissionType',
          '重构字段权限脱敏功能实现',
          'Permission模块移除DataScope注解和DataScopeType枚举相关代码',
          '重构FieldPermissionBeanSerializerModifier添加日志记录',
          '重构FieldPermissionModule构造函数并添加模块注册日志',
          '重构FieldPermissionSerializer调整权限检查顺序并添加调试日志',
          '修改JacksonConfig使用modulesToInstall方法注册模块',
          '重构MaskUtils工具类mask方法参数类型为MaskPattern',
          '使用Jackson2ObjectMapperBuilderCustomizer注册模块',
          '优化权限配置属性结构',
          '优化权限模块日志输出',
      ],

      fixed: [
          '修复FieldPermissionSerializer 中mask依旧使用String而不是MaskPattern问题',

      ],

      demo: [
          '测试接口权限功能',
          '测试字段权限功能'
      ]
    }
  },
  {
    version: 'v0.0.8-alpha',
    title: '前端重构，后端验证码机制',
    date: '2025-12-25',
    detail: {
      added: [
          '前端JunoYi-Vue-ElementPlus项目重构',
          '修复前端`upgrade.ts`中的字段引用',
          '添加junoyi-framework-captcha验证码验证核心模块',
          '添加图形化验证码',
          '添加不支持验证码类型异常类',
          '添加 AJ-Captcha 依赖',
          '添加滑块验证码背景图尺寸',
          '添加打包maven插件',

      ],
      changed: [
          '升级SpringBoot版本为3.5.0',
          '优化图形验证码生成',
          '优化图形验证码字符生成逻辑',
          '优化图形验证码数学运算模式情况生成逻辑',
          '修改验证码图片数据格式',
          '移出Aj-Captcha依赖',
          '移出其他人机验证机制',
      ],
      fixed: [
        '修复打包后日志模块出现自动配置异常bug',

      ],
      demo: [
          '测试是否正常打包',
      ]
    },
    remark: '移出的人机验证机制：滑动验证、点选验证、行为验证，在后续版本中推出，当前仅支持基础的图形验证（字符/数字运算）'
  },
  {
    version: 'v0.0.7-alpha',
    title: '后端Web模块',
    date: '2025-12-23',
    detail: {
      added: [
          '添加全局异常处理机制',
          '新增全局异常处理器',
          '新增认证异常体系以及全局异常处理',
          '新增 BaseException 支持领域标识和状态码',
          '新增 AuthException 认证异常领域类，继承 BaseException',
          '新增 LoginException 登录异常领域类，扩展认证异常  ',
          '添加登录账户相关异常处理类  ',
          '添加XSS防护过滤器和请求包装器 ',
          '添加XSS过滤器配置选项和多种过滤模式',
          '添加SQL注入增强防护功能',
          '添加跨域配置功能'
      ],
      changed: [
          '重构基础异常类',
          '移除旧的 GlobalException 类 ',
          '完善用户验证逻辑中的异常类型处理  ',
          '优化全局异常处理器功能  ',
          '完成 XSS 过滤功能',
          '优化SQL注入防护',
          '增强SQL注入防护功能',
      ],
      fixed: [
          '修复XSS过滤器配置和过滤模式',
          '修复默认XSS过滤器配置不安全的问题',
      ]

    }
  },
  {
    version: 'v0.0.6-alpha',
    title: '后端Security核心模块',
    date: '2025-12-19',
    detail: {
      added: [
        '添加junoyi-framework-security模块',
        '新增各种基类：BaseController、BaseEntity、BaseException',
        '添加 junoyi-framework-permission 权限机制封装模块',
        '添加系统用户相关实体类和枚举',
        '添加Sa-Token权限认证框架',
        '新增平台类型枚举和用户平台信息实体类',
        '添加 junoyi-framework-boot-starter 模块聚合模式',
        '新增登录用户信息类和令牌刷新功能',
        '添加JWT认证过滤器',
        '添加API加密过滤器',
        '添加令牌处理过程',
        '添加实现JWT Token服务并重构认证流程',
        '实现基于 Redis 的会话管理机制',
        '新增系统认证模块基础结构',
        '更新 SysAuthServiceImpl.java 接口，增加带 platformType 参数的 login 方法',
        '添加支持多平台登录以及Token不同有效期配置',
        '添加IP工具类和Servlet工具类',
        '引入PBKDF2密码加密工具类并优化认证逻辑',
        '添加AES和RSA加密服务及密钥管理',
        '添加实例公钥和私钥',
        '实现API请求响应加解密功能',
        '添加登录失败限制和IP限制功能',
        '添加单点登录功能支持（单点登录、多点登录配置文件切换）'
      ],
      changed: [
        '优化升级JWT库版本并调整配置',
        '优化项目结构',
        '重构Security模块',
        '重构 junoyi-framework-security 模块上下文管理机制',
        '增强日志功能并优化配置',
        '优化移出Sa-Token框架',
        '重构JWT Token服务实现',
        '完善会话管理与认证功能',
        '将MyBatis-Plus版本从3.5.5升级至3.5.7',
        '更新MyBatis-Plus starter依赖为spring-boot3-starter',
        '更新dynamic-datasource starter依赖为spring-boot3-starter',
        '屏蔽MyBatis Mapper扫描日志',
        '优化 RefreshToken 为不透明格式',
        '更新配置文件，区分 admin-web 和 front-web',
        '更新 JwtTokenService 的平台映射',
        '重构优化junoyi-framework-security 模块包结构和命名',
        '引入缓存键常量并优化会话管理',
        '优化登录失败处理逻辑（如果登录失败被锁，还继续尝试登录错误，将刷新锁定冷却时间）'
      ],
      fixed: [
        '修复Spring事件兼容问题，移除SpringApplicationStartingEvent及相关适配器',
        '修复 junoyi-framework-security 模块未加载 TokenHelper Bean 报错',
        '修复日志系统debug无法打印输出日志bug',
        '修复Mybatis-Plus不兼容问题bug',
        '修复因版本不兼容导致的配置问题'
      ]
    }
  },
  {
    version: 'v0.0.5-alpha',
    title: 'Spring事件桥接机制',
    date: '2025-12-16',
    detail: {
      added: [
        '新增Spring事件桥接机制',
        '新增Spring应用事件相关领域事件类',
        '新增 SpringApplicationEvent 类，封装Spring应用事件源和命令行参数',
        '新增 SpringApplicationReadyEvent 类，包含应用上下文和启动耗时信息',
        '新增 SpringApplicationStartingEvent 类，封装引导上下文信息',
        '添加 SpringApplicationReadyEventAdapter 适配器，转换Spring原生ApplicationReadyEvent',
        '添加 SpringApplicationStartingEventAdapter 适配器，转换Spring原生ApplicationStartingEvent',
        '新增SpringApplicationStartedEvent类，封装应用启动完成信息',
        '添加SpringApplicationStartedEventAdapter适配器，转换Spring原生ApplicationStartedEvent',
        '新增SpringContextClosedEvent类，用于表示Spring应用上下文关闭事件',
        '添加SpringContextClosedEventAdapter适配器，将Spring原生ContextClosedEvent转换为系统内部事件',
        '添加SpringApplicationContextEvent类用于封装应用上下文事件',
        '新增SpringContextRefreshedEvent适配器类',
        '新增SpringContextStartedEvent适配器类',
        '新增SpringContextStoppedEvent适配器'
      ],
      changed: [
        '优化Spring事件适配器以支持应用启动参数',
        '优化SpringContextClosedEvent继承SpringApplicationContextEvent'
      ],
      fixed: [
        '修复SpringContextStoppedEventAdapter中判断是否支持指定Spring事件方法'
      ],
      demo: [
        '在TestEventListener中增加监听处理（测试）',
        '测试Spring Context相关事件'
      ]
    },
    remark: 'SpringContextStartedEvent事件（Spring默认正常情况下不会触发该事件）'
  },
  {
    version: 'v0.0.4-alpha',
    title: 'Excel模块与事件机制',
    date: '2025-12-13',
    detail: {
      added: [
        '添加junoyi-framework-excel模块',
        '添加 @CellMerge 单元格合并注解、@ExcelDictFormat字典格式化注解、@ExcelEnumFormat枚举格式化注解',
        '添加ExcelUtils Excel表格静态工具类',
        '添加junoyi-framework-event模块',
        '添加基本事件机制',
        '添加多种事件注册机制（@EventListner注解自动扫描注册、Listener接口手动实现并手动注册）',
        '添加异步事件（异步事件线程池）',
        '添加事件总线触发方法（支持Spring Bean注入或静态方法直接调用，并且同时支持同步事件或异步事件）',
        '添加module-demo模块、module-demo-api模块用测试'
      ],
      changed: [
        '完成 excel 核心基础设置逻辑',
        '优化事件机制',
        '优化服务器端口监听器',
        '增强事件注册于监听功能'
      ],
      fixed: [
        '修复事件监听器事件优先级执行并非按照优先级的bug',
        '修复包名简化逻辑导致日志名称截取问题'
      ]
    }
  },
  {
    version: 'v0.0.3-alpha',
    title: 'JSON模块与Redis模块',
    date: '2025-12-12',
    detail: {
      added: [
        '添加junoyi-framework-json模块',
        '添加jackson配置',
        '添加json静态工具类',
        '添加junoyi-framework-redis模块',
        '添加redisson配置',
        '添加redis key键前缀处理',
        '添加 CacheUtils 缓存静态工具类',
        '添加 QueueUtils 队列静态工具类',
        '添加 RedisUtls 静态工具类，提供基于 Redisson 的 Redis 操作',
        '添加module-system模块、module-system-api模块',
        '添加获取系统信息接口'
      ],
      changed: [
        '优化junoyi-framework-redis模块'
      ]
    }
  },
  {
    version: 'v0.0.2-alpha',
    title: '核心模块与数据源模块',
    date: '2025-12-11',
    detail: {
      added: [
        '添加junoyi-framework-core核心模块',
        '添加常用核心工具类',
        '添加application.yml中junoyi相关配置读取',
        '添加HTTP协议状态常量',
        '添加junoyi-framework-starter 框架启动核心模块',
        '添加junoyi-framework-datasource模块',
        '添加datasource模块中阿里数据池配置',
        '添加多数据源处理',
        '添加SQL美化输出',
        '添加慢SQL'
      ],
      changed: [
        '优化框架启动（隐藏不必要的日志，添加junoyi banner，优化日志输出）',
        '优化datasource模块',
        '优化application.yml配置文件'
      ]
    }
  },
  {
    version: 'v0.0.1-alpha',
    title: '初始化项目框架',
    date: '2025-12-08',
    detail: {
      added: [
        '初始化项目框架',
        '添加日志系统junoyi-framework-log模块',
        '添加日志格式',
        '添加日志文件存储',
        '添加日志静态工具类、日志工厂类',
        '添加日志异步等多种功能更全方法',
        '添加日志配置'
      ],
      changed: [
        '优化日志格式'
      ],
      fixed: [
        '修复日志系统配置未读取应用bug'
      ]
    }
  }
])
