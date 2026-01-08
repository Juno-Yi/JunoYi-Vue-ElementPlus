<!-- 缓存监控页面 -->
<template>
  <div class="art-full-height">
    <!-- Redis 信息卡片 -->
    <ElCard class="mb-4" shadow="never">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div v-for="item in infoCards" :key="item.label" class="flex-c gap-3">
          <div
            class="w-10 h-10 rounded-lg flex-cc flex-shrink-0"
            :style="{ backgroundColor: `color-mix(in srgb, ${primaryColor} 15%, transparent)` }"
          >
            <ArtSvgIcon :icon="item.icon" :style="{ color: primaryColor }" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-lg font-semibold text-g-900 truncate">{{ item.value }}</div>
            <div class="text-xs text-g-500">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </ElCard>

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
        @refresh="handleRefreshAll"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton
              v-permission="'system.ui.cache.button.delete'"
              :disabled="selectedRows.length === 0"
              type="danger"
              @click="handleBatchDelete"
              v-ripple
            >
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              批量删除
            </ElButton>
            <ElButton
              v-permission="'system.ui.cache.button.clear'"
              type="danger"
              plain
              @click="handleClearAll"
              v-ripple
            >
              <ArtSvgIcon icon="ri:delete-bin-7-line" class="mr-1" />
              清空缓存
            </ElButton>
            <ElDivider direction="vertical" />
            <div class="flex-c gap-3 text-sm">
              <span class="text-g-600">
                共 <b :style="{ color: primaryColor }">{{ pagination.total }}</b> 个键
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

    <!-- 键值详情抽屉 -->
    <ElDrawer
      v-model="detailDrawerVisible"
      title="缓存详情"
      size="500px"
      :destroy-on-close="true"
    >
      <div v-if="detailLoading" class="flex-cc py-10">
        <ElIcon class="is-loading" :size="24"><Loading /></ElIcon>
      </div>
      <div v-else-if="currentDetail" class="space-y-4">
        <!-- 基本信息 -->
        <div class="bg-g-100 rounded-lg p-4">
          <div class="text-sm font-medium text-g-700 mb-3 pb-2 border-b-d">基本信息</div>
          <div class="flex items-start gap-3 py-2">
            <span class="text-sm text-g-500 w-20 flex-shrink-0">键名</span>
            <span class="text-sm text-g-800 flex-1 font-mono break-all">{{ currentDetail.key }}</span>
          </div>
          <div class="flex items-start gap-3 py-2">
            <span class="text-sm text-g-500 w-20 flex-shrink-0">类型</span>
            <ElTag :type="getTypeTagType(currentDetail.type)" size="small">{{ currentDetail.type }}</ElTag>
          </div>
          <div class="flex items-start gap-3 py-2">
            <span class="text-sm text-g-500 w-20 flex-shrink-0">TTL</span>
            <span class="text-sm text-g-800">{{ formatTTL(currentDetail.ttl) }}</span>
          </div>
          <div v-if="currentDetail.memoryUsage" class="flex items-start gap-3 py-2">
            <span class="text-sm text-g-500 w-20 flex-shrink-0">内存占用</span>
            <span class="text-sm text-g-800">{{ formatBytes(currentDetail.memoryUsage) }}</span>
          </div>
        </div>
        <!-- 值内容 -->
        <div class="bg-g-100 rounded-lg p-4">
          <div class="text-sm font-medium text-g-700 mb-3 pb-2 border-b-d flex-cb">
            <span>值内容</span>
            <ElButton size="small" text @click="copyValue">
              <ArtSvgIcon icon="ri:file-copy-line" class="mr-1" />复制
            </ElButton>
          </div>
          <div class="bg-g-200 rounded-lg p-3 max-h-96 overflow-auto">
            <pre class="text-sm font-mono text-g-800 whitespace-pre-wrap break-all m-0">{{ formatValue(currentDetail.value) }}</pre>
          </div>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { usePermission } from '@/hooks/core/usePermission'
  import { useSettingStore } from '@/store/modules/setting'
  import {
    fetchGetRedisInfo,
    fetchGetCacheKeys,
    fetchGetCacheKeyDetail,
    fetchDeleteCacheKey,
    fetchBatchDeleteCacheKeys,
    fetchClearAllCache
  } from '@/api/system/cache'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { ElTag, ElMessageBox, ElDrawer, ElIcon, ElButton, ElCard } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'
  import { useClipboard } from '@vueuse/core'

  defineOptions({ name: 'Cache' })

  const { hasPermission } = usePermission()
  const settingStore = useSettingStore()
  const { copy } = useClipboard()

  type CacheKeyVO = Api.System.CacheKeyVO
  type CacheKeyDetailVO = Api.System.CacheKeyDetailVO
  type RedisInfo = Api.System.RedisInfo

  // 主题色
  const primaryColor = computed(() => settingStore.systemThemeColor || '#409eff')

  // Redis 信息
  const redisInfo = ref<RedisInfo | null>(null)

  // 信息卡片
  const infoCards = computed(() => {
    const info = redisInfo.value
    if (!info) return []
    return [
      { label: 'Redis版本', value: info.version, icon: 'ri:server-line' },
      { label: '运行时间', value: formatUptime(info.uptimeInSeconds), icon: 'ri:time-line' },
      { label: '已用内存', value: info.usedMemoryHuman, icon: 'ri:database-2-line' },
      { label: '键数量', value: String(info.dbSize), icon: 'ri:key-2-line' },
      { label: '命中率', value: info.hitRate, icon: 'ri:focus-3-line' },
      { label: '连接数', value: String(info.connectedClients), icon: 'ri:links-line' }
    ]
  })

  // 搜索表单
  const initialSearchState = {
    pattern: undefined as string | undefined,
    type: undefined as string | undefined
  }

  const formFilters = reactive({ ...initialSearchState })

  // 类型选项
  const typeOptions = [
    { label: 'String', value: 'string' },
    { label: 'List', value: 'list' },
    { label: 'Set', value: 'set' },
    { label: 'ZSet', value: 'zset' },
    { label: 'Hash', value: 'hash' }
  ]

  const formItems = computed(() => [
    {
      label: '键名',
      key: 'pattern',
      type: 'input',
      props: { clearable: true, placeholder: '支持通配符，如 user:*' }
    },
    {
      label: '类型',
      key: 'type',
      type: 'select',
      props: { clearable: true, options: typeOptions }
    }
  ])

  // 选中行
  const selectedRows = ref<CacheKeyVO[]>([])

  // 详情抽屉
  const detailDrawerVisible = ref(false)
  const detailLoading = ref(false)
  const currentDetail = ref<CacheKeyDetailVO | null>(null)

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
  } = useTable<typeof fetchGetCacheKeys>({
    core: {
      apiFn: fetchGetCacheKeys,
      apiParams: { current: 1, size: 20 },
      columnsFactory: () => [
        { type: 'selection', width: 50, align: 'center' },
        {
          prop: 'key',
          label: '键名',
          minWidth: 300,
          headerAlign: 'center',
          showOverflowTooltip: true,
          formatter: (row: CacheKeyVO) => {
            return h('span', {
              class: 'font-mono text-sm cursor-pointer hover:underline',
              style: { color: primaryColor.value },
              onClick: () => showDetail(row)
            }, row.key)
          }
        },
        {
          prop: 'type',
          label: '类型',
          width: 100,
          align: 'center',
          headerAlign: 'center',
          formatter: (row: CacheKeyVO) => {
            return h(ElTag, { type: getTypeTagType(row.type), size: 'small' }, () => row.type)
          }
        },
        {
          prop: 'ttl',
          label: 'TTL',
          width: 140,
          align: 'center',
          headerAlign: 'center',
          formatter: (row: CacheKeyVO) => {
            const ttlText = formatTTL(row.ttl)
            const color = row.ttl === -1 ? 'var(--art-gray-500)' : row.ttl < 60 ? '#f56c6c' : row.ttl < 3600 ? '#e6a23c' : '#67c23a'
            return h('span', { style: { color } }, ttlText)
          }
        },
        {
          prop: 'memoryUsage',
          label: '内存占用',
          width: 120,
          align: 'center',
          headerAlign: 'center',
          formatter: (row: CacheKeyVO) => row.memoryUsage ? formatBytes(row.memoryUsage) : '-'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 140,
          align: 'center',
          headerAlign: 'center',
          fixed: 'right',
          formatter: (row: CacheKeyVO) => {
            return h('div', { class: 'flex-cc gap-2' }, [
              h(ElButton, { type: 'primary', size: 'small', link: true, onClick: () => showDetail(row) }, () => '查看'),
              hasPermission('system.ui.cache.button.delete')
                ? h(ElButton, { type: 'danger', size: 'small', link: true, onClick: () => handleDelete(row) }, () => '删除')
                : null
            ])
          }
        }
      ]
    }
  })

  /**
   * 获取 Redis 信息
   */
  const loadRedisInfo = async () => {
    try {
      redisInfo.value = await fetchGetRedisInfo()
    } catch {
      // 忽略错误
    }
  }

  /**
   * 刷新所有数据
   */
  const handleRefreshAll = () => {
    loadRedisInfo()
    refreshData()
  }

  /**
   * 格式化运行时间
   */
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    if (days > 0) return `${days}天${hours}小时`
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${minutes}分钟`
  }

  /**
   * 格式化 TTL
   */
  const formatTTL = (ttl: number): string => {
    if (ttl === -1) return '永不过期'
    if (ttl === -2) return '已过期'
    if (ttl < 60) return `${ttl}秒`
    if (ttl < 3600) return `${Math.floor(ttl / 60)}分钟`
    if (ttl < 86400) return `${Math.floor(ttl / 3600)}小时`
    return `${Math.floor(ttl / 86400)}天`
  }

  /**
   * 格式化字节
   */
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  /**
   * 获取类型标签类型
   */
  const getTypeTagType = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      string: 'primary',
      list: 'success',
      set: 'warning',
      zset: 'danger',
      hash: 'info'
    }
    return map[type] || 'info'
  }

  /**
   * 格式化值
   */
  const formatValue = (value: string | string[] | Record<string, string>): string => {
    if (typeof value === 'string') {
      try {
        return JSON.stringify(JSON.parse(value), null, 2)
      } catch {
        return value
      }
    }
    return JSON.stringify(value, null, 2)
  }

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
  const handleSelectionChange = (selection: CacheKeyVO[]) => {
    selectedRows.value = selection
  }

  /**
   * 查看详情
   */
  const showDetail = async (row: CacheKeyVO) => {
    detailDrawerVisible.value = true
    detailLoading.value = true
    try {
      currentDetail.value = await fetchGetCacheKeyDetail(row.key)
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 复制值
   */
  const copyValue = () => {
    if (currentDetail.value) {
      const text = formatValue(currentDetail.value.value)
      copy(text)
      ElMessage.success('已复制到剪贴板')
    }
  }

  /**
   * 删除缓存键
   */
  const handleDelete = async (row: CacheKeyVO) => {
    try {
      await ElMessageBox.confirm(`确定要删除键「${row.key}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteCacheKey(row.key)
      handleRefreshAll()
    } catch {
      // 用户取消
    }
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的缓存键')
      return
    }
    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个缓存键吗？`, '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const keys = selectedRows.value.map(item => item.key)
      await fetchBatchDeleteCacheKeys(keys)
      selectedRows.value = []
      handleRefreshAll()
    } catch {
      // 用户取消
    }
  }

  /**
   * 清空所有缓存
   */
  const handleClearAll = async () => {
    try {
      await ElMessageBox.confirm('确定要清空所有缓存吗？此操作不可恢复！', '清空缓存', {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'error'
      })
      await fetchClearAllCache()
      handleRefreshAll()
    } catch {
      // 用户取消
    }
  }

  onMounted(() => {
    loadRedisInfo()
  })
</script>
