<template>
  <div class="art-full-height permission-pool-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-section">
        <ElInput
          v-model="newPermission.permission"
          placeholder="权限标识，如：system.user.add"
          clearable
          class="add-input"
          @keyup.enter="handleQuickAdd"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:key-2-line" />
          </template>
        </ElInput>
        <ElInput
          v-model="newPermission.description"
          placeholder="描述（可选）"
          clearable
          class="add-input-desc"
          @keyup.enter="handleQuickAdd"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:file-text-line" />
          </template>
        </ElInput>
        <ElButton type="primary" @click="handleQuickAdd" v-ripple>
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          添加
        </ElButton>
      </div>
      <div class="toolbar-section">
        <ElInput
          v-model="searchKeyword"
          placeholder="搜索..."
          clearable
          class="search-input"
          @input="handleSearchInput"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:search-line" />
          </template>
        </ElInput>
        <ElSelect
          v-model="searchStatus"
          placeholder="状态"
          clearable
          class="status-filter"
          @change="handleSearch"
        >
          <ElOption label="启用" :value="1" />
          <ElOption label="禁用" :value="0" />
        </ElSelect>
        <ElButton
          v-if="selectedIds.length > 0"
          type="danger"
          @click="handleBatchDelete"
          v-ripple
        >
          删除 ({{ selectedIds.length }})
        </ElButton>
        <ElButton circle @click="refreshData" v-ripple>
          <ArtSvgIcon icon="ri:refresh-line" />
        </ElButton>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-area" v-loading="loading">
      <!-- 统计栏 -->
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
      <div class="tags-container" v-if="data.length > 0">
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
      <div class="pagination-bar" v-if="data.length > 0">
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
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
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

  // 新增权限表单
  const newPermission = ref({
    permission: '',
    description: ''
  })

  // 搜索
  const searchKeyword = ref('')
  const searchStatus = ref<number | undefined>(undefined)

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

      if (searchKeyword.value) {
        params.permission = searchKeyword.value
        params.description = searchKeyword.value
      }

      if (searchStatus.value !== undefined) {
        params.status = searchStatus.value
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
  const handleQuickAdd = async () => {
    if (!newPermission.value.permission.trim()) {
      ElMessage.warning('请输入权限标识')
      return
    }

    try {
      await fetchAddPermissionPool({
        ...newPermission.value,
        status: 1
      })
      newPermission.value = {
        permission: '',
        description: ''
      }
      refreshData()
    } catch (error) {
      console.error('添加权限失败:', error)
    }
  }

  /**
   * 搜索输入（防抖）
   */
  let searchTimer: NodeJS.Timeout | null = null
  const handleSearchInput = () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      handleSearch()
    }, 500)
  }

  /**
   * 搜索
   */
  const handleSearch = () => {
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

  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped>
  .permission-pool-page {
    display: flex;
    flex-direction: column;
    background: var(--el-bg-color-page);
    padding: 16px;
    gap: 16px;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    .toolbar-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .add-input {
      width: 280px;
    }

    .add-input-desc {
      width: 200px;
    }

    .search-input {
      width: 200px;
    }

    .status-filter {
      width: 120px;
    }
  }

  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--el-bg-color);
    border-radius: 8px;
    padding: 20px;
    min-height: 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    .stats-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      margin-bottom: 20px;

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
              max-width: 300px;
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

    .pagination-bar {
      display: flex;
      justify-content: center;
      padding-top: 20px;
      margin-top: auto;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  @media (max-width: 1200px) {
    .toolbar {
      flex-direction: column;
      align-items: stretch;

      .toolbar-section {
        width: 100%;
      }

      .add-input,
      .add-input-desc,
      .search-input {
        flex: 1;
        min-width: 150px;
      }
    }
  }

  @media (max-width: 768px) {
    .permission-pool-page {
      padding: 12px;
    }

    .toolbar {
      .add-input,
      .add-input-desc,
      .search-input,
      .status-filter {
        width: 100%;
      }
    }

    .content-area {
      .tags-container {
        .permission-tag-item {
          width: 100%;

          .tag-content {
            .tag-text {
              max-width: 150px;
            }

            .tag-desc {
              max-width: 100px;
            }
          }
        }
      }
    }
  }
</style>
