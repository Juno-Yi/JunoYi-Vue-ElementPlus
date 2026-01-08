<template>
  <div class="art-full-height">
    <!-- 快速添加区域 -->
    <PermissionPoolAdd @add="handleQuickAdd" />

    <!-- 搜索栏 -->
    <PermissionPoolSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <!-- 主内容卡片 -->
    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <!-- 表格头部 -->
      <ArtTableHeader
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton
              :disabled="selectedIds.length === 0"
              @click="handleBatchDelete"
              v-ripple
            >
              批量删除
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 统计信息 -->
      <div class="stats-bar">
        <span class="stats-text">共 {{ pagination.total }} 个权限</span>
        <span class="stats-text" v-if="selectedIds.length > 0">已选 {{ selectedIds.length }} 个</span>
        <ElButton
          text
          size="small"
          @click="handleSelectAll"
          v-if="data.length > 0"
        >
          {{ isAllSelected ? '取消全选' : '全选' }}
        </ElButton>
      </div>

      <!-- 权限标签云 -->
      <div class="tags-container" v-loading="loading" v-if="data.length > 0">
        <div
          v-for="item in data"
          :key="item.id"
          class="permission-tag-item"
          :class="{
            'is-selected': selectedIds.includes(item.id),
            'is-disabled': item.status === 0
          }"
        >
          <ElCheckbox
            :model-value="selectedIds.includes(item.id)"
            @change="handleSelectChange(item.id, $event)"
            class="tag-checkbox"
          />
          <div class="tag-content" @click="handleSelectChange(item.id, !selectedIds.includes(item.id))">
            <div class="tag-main">
              <ArtSvgIcon icon="ri:key-2-line" class="tag-icon" />
              <span class="tag-text" :title="item.permission">{{ item.permission }}</span>
              <ElTag
                size="small"
                effect="plain"
                class="tag-type"
                :type="getPermissionType(item.permission).tagType as any"
              >
                <ArtSvgIcon :icon="getPermissionType(item.permission).icon" class="mr-1" />
                {{ getPermissionType(item.permission).type }}
              </ElTag>
              <ElTag
                :type="item.status === 1 ? 'success' : 'info'"
                size="small"
                effect="plain"
                class="tag-status"
              >
                {{ item.status === 1 ? '启用' : '禁用' }}
              </ElTag>
            </div>
            <div class="tag-desc" v-if="item.description" :title="item.description">
              {{ item.description }}
            </div>
          </div>
          <ElButton
            type="danger"
            size="small"
            text
            circle
            class="tag-delete"
            @click.stop="handleDelete(item)"
          >
            <ArtSvgIcon icon="ri:close-line" />
          </ElButton>
        </div>
      </div>

      <!-- 空状态 -->
      <ElEmpty v-if="!loading && data.length === 0" description="暂无权限数据" />

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="data.length > 0">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[20, 50, 100, 200]"
          :total="pagination.total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import PermissionPoolAdd from './modules/permission-pool-add.vue'
  import PermissionPoolSearch from './modules/permission-pool-search.vue'
  import {
    fetchGetPermissionPoolList,
    fetchAddPermissionPool,
    fetchDeletePermissionPool,
    fetchDeletePermissionPoolBatch
  } from '@/api/system/permissionPool'

  defineOptions({ name: 'PermissionPool' })

  type PermissionPoolVO = Api.System.PermissionPoolVO

  const loading = ref(false)
  const data = ref<PermissionPoolVO[]>([])
  const selectedIds = ref<number[]>([])
  const showSearchBar = ref(true)

  // 搜索表单
  const searchForm = ref({
    permission: undefined,
    description: undefined,
    status: undefined
  })

  // 搜索参数
  const searchParams = reactive({
    permission: undefined,
    description: undefined,
    status: undefined
  })

  // 分页
  const pagination = ref({
    current: 1,
    size: 50,
    total: 0
  })

  // 全选状态
  const isAllSelected = computed(() => {
    return data.value.length > 0 && selectedIds.value.length === data.value.length
  })

  /**
   * 获取权限池列表
   */
  const getData = async () => {
    loading.value = true
    try {
      const params: any = {
        current: pagination.value.current,
        size: pagination.value.size
      }

      // 添加搜索参数
      if (searchParams.permission) {
        params.permission = searchParams.permission
      }
      if (searchParams.description) {
        params.description = searchParams.description
      }
      if (searchParams.status !== undefined) {
        params.status = searchParams.status
      }

      const result = await fetchGetPermissionPoolList(params)
      console.log('权限池数据返回:', result)
      
      data.value = result.list || result.records || []
      pagination.value.total = result.total || 0
    } catch (error) {
      console.error('获取权限池列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新数据
   */
  const refreshData = () => {
    selectedIds.value = []
    getData()
  }

  /**
   * 快速添加权限
   */
  const handleQuickAdd = async (data: { permission: string; description: string }) => {
    if (!data.permission.trim()) {
      ElMessage.warning('请输入权限标识')
      return
    }

    try {
      await fetchAddPermissionPool({
        ...data,
        status: 1
      })
      refreshData()
    } catch (error) {
      console.error('添加权限失败:', error)
    }
  }

  /**
   * 搜索处理
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    pagination.value.current = 1
    getData()
  }

  /**
   * 重置搜索参数
   */
  const resetSearchParams = () => {
    Object.assign(searchParams, {
      permission: undefined,
      description: undefined,
      status: undefined
    })
    pagination.value.current = 1
    getData()
  }

  /**
   * 全选/取消全选
   */
  const handleSelectAll = () => {
    if (isAllSelected.value) {
      selectedIds.value = []
    } else {
      selectedIds.value = data.value.map(item => item.id)
    }
  }

  /**
   * 选择变化
   */
  const handleSelectChange = (id: number, checked: boolean) => {
    if (checked) {
      if (!selectedIds.value.includes(id)) {
        selectedIds.value.push(id)
      }
    } else {
      const index = selectedIds.value.indexOf(id)
      if (index > -1) {
        selectedIds.value.splice(index, 1)
      }
    }
  }

  /**
   * 删除单个权限
   */
  const handleDelete = async (item: PermissionPoolVO) => {
    try {
      await ElMessageBox.confirm(
        `确定删除权限「${item.permission}」吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await fetchDeletePermissionPool(item.id)
      refreshData()
    } catch {
      // 用户取消
    }
  }

  /**
   * 批量删除权限
   */
  const handleBatchDelete = async () => {
    if (selectedIds.value.length === 0) {
      ElMessage.warning('请选择要删除的权限')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定删除选中的 ${selectedIds.value.length} 个权限吗？`,
        '批量删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await fetchDeletePermissionPoolBatch(selectedIds.value)
      selectedIds.value = []
      refreshData()
    } catch {
      // 用户取消
    }
  }

  /**
   * 分页大小变化
   */
  const handleSizeChange = (size: number) => {
    pagination.value.size = size
    getData()
  }

  /**
   * 当前页变化
   */
  const handleCurrentChange = (current: number) => {
    pagination.value.current = current
    getData()
  }

  /**
   * 获取权限类型
   */
  const getPermissionType = (permission: string): { type: string; tagType: string; icon: string } => {
    const lowerPermission = permission.toLowerCase()
    
    // 通配符权限（包含 * 号）
    if (permission.includes('*')) {
      return { type: '通配符', tagType: 'warning', icon: 'ri:asterisk' }
    }
    // UI权限
    if (lowerPermission.includes('.ui.')) {
      return { type: 'UI', tagType: 'primary', icon: 'ri:layout-line' }
    }
    // API权限
    if (lowerPermission.includes('.api.')) {
      return { type: 'API', tagType: 'success', icon: 'ri:code-box-line' }
    }
    // DATA权限
    if (lowerPermission.includes('.data.')) {
      return { type: 'DATA', tagType: 'danger', icon: 'ri:database-2-line' }
    }
    // 其他
    return { type: '其他', tagType: 'info', icon: 'ri:more-line' }
  }

  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped>
  .art-table-card {
    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .stats-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      margin-bottom: 16px;

      .stats-text {
        font-size: 14px;
        color: var(--el-text-color-secondary);

        &:nth-child(2) {
          color: var(--el-color-primary);
          font-weight: 500;
        }
      }

      .el-button {
        margin-left: auto;
      }
    }

    .tags-container {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-content: flex-start;
      overflow-y: auto;
      padding: 4px;
      min-height: 200px;

      .permission-tag-item {
        display: inline-flex;
        align-items: flex-start;
        gap: 8px;
        padding: 10px 12px;
        background: var(--el-fill-color-blank);
        border: 1px solid var(--el-border-color-light);
        border-radius: 6px;
        transition: all 0.2s;
        cursor: pointer;
        max-width: 100%;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);

          .tag-delete {
            opacity: 1;
          }
        }

        &.is-selected {
          border-color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        &.is-disabled {
          opacity: 0.6;
        }

        .tag-checkbox {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .tag-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 0;

          .tag-main {
            display: flex;
            align-items: center;
            gap: 6px;

            .tag-icon {
              color: var(--el-color-primary);
              font-size: 14px;
              flex-shrink: 0;
            }

            .tag-text {
              font-size: 13px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 250px;
            }

            .tag-type {
              flex-shrink: 0;
              font-weight: 500;
            }

            .tag-status {
              flex-shrink: 0;
            }
          }

          .tag-desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            line-height: 1.4;
            padding-left: 20px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .tag-delete {
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.2s;
          margin-top: 2px;
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      padding-top: 16px;
      margin-top: auto;
    }
  }

  @media (max-width: 768px) {
    .art-table-card {
      .tags-container {
        .permission-tag-item {
          width: 100%;

          .tag-content {
            .tag-main {
              .tag-text {
                max-width: 150px;
              }
            }
          }
        }
      }
    }
  }
</style>
