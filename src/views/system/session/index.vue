<!-- 会话监控页面 -->
<template>
  <div class="art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton
              v-permission="'system.ui.session.button.logout'"
              :disabled="selectedRows.length === 0"
              @click="handleBatchLogout"
              v-ripple
            >
              批量下线
            </ElButton>
            <ElDivider direction="vertical" />
            <div class="flex items-center gap-3 text-sm">
              <span class="inline-flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span class="text-gray-600 dark:text-gray-300">在线 <b class="text-green-600">{{ pagination.total }}</b></span>
              </span>
            </div>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { usePermission } from '@/hooks/core/usePermission'
  import { fetchGetSessionList, fetchForceLogout, fetchBatchKickOut } from '@/api/system/session'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { ElTag, ElMessageBox, ElProgress } from 'element-plus'

  defineOptions({ name: 'Session' })

  const { hasPermission } = usePermission()

  type SessionVO = Api.System.SessionVO

  // 搜索表单
  const initialSearchState = {
    userName: undefined as string | undefined,
    nickName: undefined as string | undefined,
    loginIp: undefined as string | undefined,
    platformType: undefined as string | undefined
  }

  const formFilters = reactive({ ...initialSearchState })

  // 平台选项 (对应后端 PlatformType 枚举名称)
  const platformOptions = [
    { label: '后台网站', value: 'ADMIN_WEB' },
    { label: '前台网站', value: 'FRONT_DESK_WEB' },
    { label: '小程序', value: 'MINI_PROGRAM' },
    { label: 'APP', value: 'APP' },
    { label: '桌面应用', value: 'DESKTOP_APP' }
  ]

  const formItems = computed(() => [
    {
      label: '用户名',
      key: 'userName',
      type: 'input',
      props: { clearable: true, placeholder: '请输入用户名' }
    },
    {
      label: '昵称',
      key: 'nickName',
      type: 'input',
      props: { clearable: true, placeholder: '请输入昵称' }
    },
    {
      label: '登录IP',
      key: 'loginIp',
      type: 'input',
      props: { clearable: true, placeholder: '请输入IP地址' }
    },
    {
      label: '平台类型',
      key: 'platformType',
      type: 'select',
      props: { clearable: true, options: platformOptions }
    }
  ])

  // 选中行
  const selectedRows = ref<SessionVO[]>([])

  // 平台配置 (对应后端 PlatformType 枚举名称)
  const platformConfig: Record<string, { icon: string; color: string; label: string }> = {
    ADMIN_WEB: { icon: 'ri:dashboard-line', color: '#409eff', label: '后台网站' },
    FRONT_DESK_WEB: { icon: 'ri:global-line', color: '#67c23a', label: '前台网站' },
    MINI_PROGRAM: { icon: 'ri:wechat-line', color: '#07c160', label: '小程序' },
    APP: { icon: 'ri:smartphone-line', color: '#e6a23c', label: 'APP' },
    DESKTOP_APP: { icon: 'ri:computer-line', color: '#909399', label: '桌面应用' }
  }

  /**
   * 获取平台配置
   */
  const getPlatformConfig = (platformType: string) => {
    return platformConfig[platformType] || { icon: 'ri:question-line', color: '#909399', label: '未知' }
  }

  /**
   * 计算会话剩余时间百分比 (基于 accessExpireTime)
   */
  const getSessionProgress = (loginTime: string, accessExpireTime: number): number => {
    const now = Date.now()
    const login = new Date(loginTime).getTime()
    const expire = accessExpireTime
    const total = expire - login
    const remaining = expire - now
    if (remaining <= 0) return 0
    return Math.round((remaining / total) * 100)
  }

  /**
   * 格式化剩余时间
   */
  const formatRemainingTime = (expireTime: number): string => {
    const now = Date.now()
    const diff = expireTime - now
    if (diff <= 0) return '已过期'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${minutes}分钟`
  }

  /**
   * 格式化时间
   */
  const formatTime = (time: string | undefined): string => {
    if (!time) return '-'
    const date = new Date(time)
    if (isNaN(date.getTime())) return '-'
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  /**
   * 格式化时间戳
   */
  const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return '-'
    return formatTime(new Date(timestamp).toISOString())
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetSessionList,
      apiParams: { current: 1, size: 20 },
      columnsFactory: () => [
        { type: 'selection', width: 50, align: 'center' },
        {
          prop: 'userName',
          label: '用户信息',
          minWidth: 160,
          headerAlign: 'center',
          formatter: (row: SessionVO) => {
            return h('div', { class: 'flex items-center gap-2' }, [
              h('div', { class: 'w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center' }, [
                h(ArtSvgIcon, { icon: 'ri:user-line', class: 'text-primary' })
              ]),
              h('div', {}, [
                h('div', { class: 'font-medium' }, row.userName),
                h('div', { class: 'text-xs text-gray-400' }, row.nickName || '-')
              ])
            ])
          }
        },
        {
          prop: 'platformType',
          label: '平台类型',
          width: 120,
          align: 'center',
          headerAlign: 'center',
          formatter: (row: SessionVO) => {
            const config = getPlatformConfig(row.platformType)
            return h('div', { class: 'flex items-center justify-center gap-1' }, [
              h(ArtSvgIcon, { icon: config.icon, style: { color: config.color } }),
              h('span', {}, config.label)
            ])
          }
        },
        {
          prop: 'loginIp',
          label: '登录IP',
          width: 150,
          align: 'center',
          headerAlign: 'center',
          formatter: (row: SessionVO) => {
            return h('div', {}, [
              h('div', { class: 'font-mono text-sm' }, row.loginIp || '-'),
              row.ipRegion ? h('div', { class: 'text-xs text-gray-400' }, row.ipRegion) : null
            ])
          }
        },
        {
          prop: 'loginTime',
          label: '登录时间',
          width: 170,
          align: 'center',
          headerAlign: 'center',
          formatter: (row: SessionVO) => formatTime(row.loginTime)
        },
        {
          prop: 'lastAccessTime',
          label: '最后访问',
          width: 170,
          align: 'center',
          headerAlign: 'center',
          formatter: (row: SessionVO) => formatTime(row.lastAccessTime)
        },
        {
          prop: 'accessExpireTime',
          label: '会话有效期',
          width: 180,
          align: 'center',
          headerAlign: 'center',
          formatter: (row: SessionVO) => {
            const progress = getSessionProgress(row.loginTime, row.accessExpireTime)
            const remaining = formatRemainingTime(row.accessExpireTime)
            const color = progress > 50 ? '#67c23a' : progress > 20 ? '#e6a23c' : '#f56c6c'
            return h('div', { class: 'w-full px-2' }, [
              h(ElProgress, {
                percentage: progress,
                color: color,
                strokeWidth: 6,
                showText: false
              }),
              h('div', { class: 'text-xs text-gray-500 mt-1' }, `剩余 ${remaining}`)
            ])
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          align: 'center',
          headerAlign: 'center',
          formatter: () => {
            // 能获取到的都是在线的
            return h(ElTag, {
              type: 'success',
              size: 'small',
              effect: 'light'
            }, () => '在线')
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 100,
          align: 'center',
          headerAlign: 'center',
          fixed: 'right',
          formatter: (row: SessionVO) => {
            if (!hasPermission('system.ui.session.button.logout')) return '-'
            return h(ElButton, {
              type: 'danger',
              size: 'small',
              link: true,
              onClick: () => handleForceLogout(row)
            }, () => [
              h(ArtSvgIcon, { icon: 'ri:logout-box-r-line', class: 'mr-1' }),
              '强制下线'
            ])
          }
        }
      ]
    }
  })

  /**
   * 搜索
   */
  const handleSearch = () => {
    Object.assign(searchParams, formFilters)
    getData()
  }

  /**
   * 重置
   */
  const handleReset = () => {
    Object.assign(formFilters, initialSearchState)
    resetSearchParams()
    getData()
  }

  /**
   * 选择变化
   */
  const handleSelectionChange = (selection: SessionVO[]) => {
    selectedRows.value = selection
  }

  /**
   * 强制下线
   */
  const handleForceLogout = async (row: SessionVO) => {
    try {
      await ElMessageBox.confirm(
        `确定要强制下线用户「${row.userName}」吗？`,
        '强制下线',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )
      await fetchForceLogout(row.sessionId)
      refreshData()
    } catch {
      // 用户取消
    }
  }

  /**
   * 批量踢出会话
   */
  const handleBatchLogout = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要踢出的会话')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确定要踢出选中的 ${selectedRows.value.length} 个会话吗？`,
        '批量踢出',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )
      const ids = selectedRows.value.map(item => item.sessionId)
      await fetchBatchKickOut(ids)
      selectedRows.value = []
      refreshData()
    } catch {
      // 用户取消
    }
  }
</script>

<style scoped>
  :deep(.el-progress-bar__outer) {
    border-radius: 3px;
  }
  :deep(.el-progress-bar__inner) {
    border-radius: 3px;
  }
</style>
