<template>
  <div class="art-full-height permission-pool-container">
    <!-- 顶部操作区 -->
    <ElCard class="art-card-xs operation-card" shadow="never">
      <div class="operation-wrapper">
        <div class="add-permission-form">
          <ElInput
            v-model="newPermission.permission"
            placeholder="权限标识，如：system.user.add"
            clearable
            class="permission-input"
            @keyup.enter="handleQuickAdd"
          >
            <template #prepend>
              <ArtSvgIcon icon="ri:key-2-line" />
            </template>
          </ElInput>
          <ElInput
            v-model="newPermission.description"
            placeholder="权限描述（可选）"
            clearable
            class="description-input"
            @keyup.enter="handleQuickAdd"
          >
            <template #prepend>
              <ArtSvgIcon icon="ri:file-text-line" />
            </template>
          </ElInput>
          <ElButton type="primary" @click="handleQuickAdd" v-ripple>
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            快速添加
          </ElButton>
        </div>
        <div class="batch-actions">
          <ElButton
            v-if="selectedIds.length > 0"
            type="danger"
            @click="handleBatchDelete"
            v-ripple
          >
            <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
            批量删除 ({{ selectedIds.length }})
          </ElButton>
        </div>
      </div>
    </ElCard>

    <!-- 搜索栏 -->
    <ElCard class="art-card-xs search-card" shadow="never">
      <div class="search-wrapper">
        <ElInput
          v-model="searchForm.permission"
          placeholder="搜索权限标识"
          clearable
          class="search-input"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:search-line" />
          </template>
        </ElInput>
        <ElInput
          v-model="searchForm.description"
          placeholder="搜索权限描述"
          clearable
          class="search-input"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:search-line" />
          </template>
        </ElInput>
        <ElSelect
          v-model="searchForm.status"
          placeholder="状态筛选"
          clearable
          class="status-filter"
          @change="handleSearch"
        >
          <ElOption label="启用" :value="1" />
          <ElOption label="禁用" :value="0" />
        </ElSelect>
        <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
        <ElButton @click="handleReset" v-ripple>重置</ElButton>
      </div>
    </ElCard>

    <!-- 权限卡片列表 -->
    <ElCard class="art-table-card permission-list-card" shadow="never" v-loading="loading">
      <div class="permission-grid">
        <div
          v-for="item in data"
          :key="item.id"
          class="permission-card"
          :class="{ 'is-selected': selectedIds.includes(item.id), 'is-disabled': item.status === 0 }"
        >
          <div class="card-header">
            <ElCheckbox
              :model-value="selectedIds.includes(item.id)"
              @change="handleSelectChange(item.id, $event)"
              class="card-checkbox"
            />
            <ElTag :type="item.status === 1 ? 'success' : 'danger'" size="small">
              {{ item.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          </div>
          <div class="card-body">
            <div class="permission-key">
              <ArtSvgIcon icon="ri:key-2-line" class="key-icon" />
              <span class="key-text">{{ item.permission }}</span>
            </div>
            <div class="permission-desc" v-if="item.description">
              <ArtSvgIcon icon="ri:file-text-line" class="desc-icon" />
              <span class="desc-text">{{ item.description }}</span>
            </div>
            <div class="permission-time" v-if="item.createTime">
              <ArtSvgIcon icon="ri:time-line" class="time-icon" />
              <span class="time-text">{{ formatTime(item.createTime) }}</span>
            </div>
          </div>
          <div class="card-footer">
            <ElButton
              type="danger"
              size="small"
              text
              @click="handleDelete(item)"
            >
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              删除
            </ElButton>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <ElEmpty v-if="!loading && data.length === 0" description="暂无权限数据" />

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="data.length > 0">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[12, 24, 48, 96]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage } from 'element-plus'
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

  // 搜索表单
  const searchForm = ref({
    permission: '',
    description: '',
    status: undefined as number | undefined
  })

  // 分页
  const pagination = ref({
    current: 1,
    size: 12,
    total: 0
  })

  /**
   * 获取权限池列表
   */
  const getData = async () => {
    loading.value = true
    try {
      const params = {
        ...searchForm.value,
        current: pagination.value.current,
        size: pagination.value.size
      }
      const result = await fetchGetPermissionPoolList(params)
      data.value = result.records || []
      pagination.value.total = result.total || 0
    } catch (error) {
      console.error('获取权限池列表失败:', error)
    } finally {
      loading.value = false
    }
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
      // 添加时默认状态为启用（1）
      await fetchAddPermissionPool({
        ...newPermission.value,
        status: 1
      })
      // 重置表单
      newPermission.value = {
        permission: '',
        description: ''
      }
      // 刷新列表
      getData()
    } catch (error) {
      console.error('添加权限失败:', error)
    }
  }

  /**
   * 删除单个权限
   */
  const handleDelete = async (item: PermissionPoolVO) => {
    try {
      await ElMessageBox.confirm(
        `确定删除权限「${item.permission}」吗？此操作不可恢复！`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await fetchDeletePermissionPool(item.id)
      getData()
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
        `确定删除选中的 ${selectedIds.value.length} 个权限吗？此操作不可恢复！`,
        '批量删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await fetchDeletePermissionPoolBatch(selectedIds.value)
      selectedIds.value = []
      getData()
    } catch {
      // 用户取消
    }
  }

  /**
   * 选择变化
   */
  const handleSelectChange = (id: number, checked: boolean) => {
    if (checked) {
      selectedIds.value.push(id)
    } else {
      const index = selectedIds.value.indexOf(id)
      if (index > -1) {
        selectedIds.value.splice(index, 1)
      }
    }
  }

  /**
   * 搜索
   */
  const handleSearch = () => {
    pagination.value.current = 1
    getData()
  }

  /**
   * 重置
   */
  const handleReset = () => {
    searchForm.value = {
      permission: '',
      description: '',
      status: undefined
    }
    pagination.value.current = 1
    getData()
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
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped>
  .permission-pool-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .operation-card {
    .operation-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;

      .add-permission-form {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;

        .permission-input {
          flex: 2;
          min-width: 200px;
        }

        .description-input {
          flex: 2;
          min-width: 200px;
        }
      }

      .batch-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .search-card {
    .search-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .search-input {
        flex: 1;
        min-width: 200px;
      }

      .status-filter {
        width: 150px;
      }
    }
  }

  .permission-list-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .permission-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .permission-card {
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      padding: 16px;
      background: var(--el-bg-color);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      &.is-selected {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      &.is-disabled {
        opacity: 0.6;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .card-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;

        .permission-key {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          color: var(--el-text-color-primary);

          .key-icon {
            color: var(--el-color-primary);
            font-size: 16px;
          }

          .key-text {
            word-break: break-all;
          }
        }

        .permission-desc {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: var(--el-text-color-regular);

          .desc-icon {
            margin-top: 2px;
            font-size: 14px;
            flex-shrink: 0;
          }

          .desc-text {
            word-break: break-all;
          }
        }

        .permission-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--el-text-color-secondary);

          .time-icon {
            font-size: 14px;
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
        border-top: 1px solid var(--el-border-color-lighter);
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
    .operation-card {
      .operation-wrapper {
        flex-direction: column;
        align-items: stretch;

        .add-permission-form {
          flex-direction: column;

          .permission-input,
          .description-input {
            width: 100%;
          }
        }
      }
    }

    .search-card {
      .search-wrapper {
        flex-direction: column;

        .search-input {
          width: 100%;
        }

        .status-filter {
          width: 100%;
        }
      }
    }

    .permission-list-card {
      .permission-grid {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
