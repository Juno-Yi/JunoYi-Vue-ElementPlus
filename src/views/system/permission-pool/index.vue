<template>
  <div class="art-full-height permission-pool-page">
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
        <span class="stats-text stats-selected" v-if="selectedIds.length > 0">
          已选 {{ selectedIds.length }} 个
        </span>
        <ElButton
          text
          size="small"
          class="stats-action"
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
          @click="handleSelectChange(item.id, !selectedIds.includes(item.id))"
        >
          <!-- 复选框 -->
          <ElCheckbox
            :model-value="selectedIds.includes(item.id)"
            @change="handleSelectChange(item.id, $event)"
            @click.stop
            class="tag-checkbox"
          />

          <!-- 标签信息 -->
          <div class="tag-info">
            <div class="tag-header">
              <span class="tag-key" :title="item.permission">{{ item.permission }}</span>
              <ElTag
                size="small"
                effect="plain"
                class="tag-type"
                :type="getPermissionType(item.permission).tagType as any"
              >
                {{ getPermissionType(item.permission).type }}
              </ElTag>
            </div>
            <div class="tag-desc" v-if="item.description" :title="item.description">
              {{ item.description }}
            </div>
          </div>

          <!-- 操作区域 -->
          <div class="tag-actions" @click.stop>
            <ElSwitch
              :model-value="item.status === 1"
              size="small"
              class="tag-switch"
              @change="handleToggleStatus(item)"
            />
            <ElButton
              type="danger"
              size="small"
              text
              circle
              class="tag-delete"
              @click="handleDelete(item)"
            >
              <ArtSvgIcon icon="ri:close-line" :size="14" />
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
    fetchDeletePermissionPoolBatch,
    fetchUpdatePermissionPoolStatus
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
  const handleQuickAdd = async (formData: { permission: string; description: string }) => {
    if (!formData.permission.trim()) {
      ElMessage.warning('请输入权限标识')
      return
    }

    try {
      await fetchAddPermissionPool({
        ...formData,
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
  const handleSelectChange = (id: number, checked: boolean | string | number) => {
    const isChecked = Boolean(checked)
    if (isChecked) {
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
   * 切换权限状态
   */
  const handleToggleStatus = async (item: PermissionPoolVO) => {
    const newStatus = item.status === 1 ? 0 : 1
    try {
      await fetchUpdatePermissionPoolStatus(item.id, newStatus)
      item.status = newStatus
    } catch (error) {
      console.error('更新权限状态失败:', error)
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
  const getPermissionType = (permission: string): { type: string; tagType: string } => {
    const lowerPermission = permission.toLowerCase()

    if (permission.includes('*')) {
      return { type: '通配符', tagType: 'warning' }
    }
    if (lowerPermission.includes('.ui.')) {
      return { type: 'UI', tagType: 'primary' }
    }
    if (lowerPermission.includes('.api.')) {
      return { type: 'API', tagType: 'success' }
    }
    if (lowerPermission.includes('.data.')) {
      return { type: 'DATA', tagType: 'danger' }
    }
    return { type: '其他', tagType: 'info' }
  }

  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped>
  @import './styles/index.scss';
</style>
