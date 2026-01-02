<!-- 用户管理页面 -->
<template>
  <div class="art-full-height">
    <div class="box-border flex gap-4 h-full max-md:block max-md:gap-0 max-md:h-auto">
      <!-- 左侧部门树 -->
      <div class="flex-shrink-0 h-full max-md:w-full max-md:h-auto max-md:mb-5" :class="isTreeCollapsed ? 'w-12' : 'w-58'">
        <ElCard class="tree-card art-card-xs flex flex-col h-full mt-0" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <b v-if="!isTreeCollapsed">部门</b>
              <ElButton link @click="toggleTreeCollapse">
                <ArtSvgIcon :icon="isTreeCollapsed ? 'ri:menu-unfold-line' : 'ri:menu-fold-line'" />
              </ElButton>
            </div>
          </template>
          <template v-if="!isTreeCollapsed">
            <ElInput
              v-model="deptSearchKey"
              placeholder="搜索部门"
              clearable
              class="mb-3 px-2"
              :prefix-icon="Search"
            />
            <ElScrollbar>
              <ElTree
                ref="deptTreeRef"
                :data="deptTreeData"
                :props="{ label: 'name', children: 'children' }"
                node-key="id"
                highlight-current
                default-expand-all
                :filter-node-method="filterDeptNode"
                @node-click="handleDeptClick"
              >
                <template #default="{ node, data }">
                  <span class="dept-tree-node">
                    <ArtSvgIcon 
                      :icon="data.id === 0 ? 'ri:building-line' : 'ri:folder-line'" 
                      class="mr-1.5"
                    />
                    <span>{{ node.label }}</span>
                  </span>
                </template>
              </ElTree>
            </ElScrollbar>
          </template>
        </ElCard>
      </div>

      <!-- 右侧用户列表 -->
      <div class="flex flex-col flex-grow min-w-0">
        <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

        <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
          <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            <template #left>
              <ElSpace wrap>
                <ElButton @click="showDialog('add')" v-ripple type="primary">新增用户</ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>

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
    </div>

    <!-- 用户弹窗 -->
    <UserDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :user-data="currentUserData"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { Search } from '@element-plus/icons-vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList } from '@/api/system/user'
  import { fetchGetDeptTree } from '@/api/system/department'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessageBox, ElImage, ElTree } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'User' })

  type SysUserVO = Api.System.SysUserVO

  // 部门树相关
  const deptTreeRef = ref<InstanceType<typeof ElTree>>()
  const deptTreeData = ref<any[]>([])
  const deptSearchKey = ref('')
  const selectedDeptId = ref<number | null>(null)
  const isTreeCollapsed = ref(false)

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<SysUserVO>>({})

  // 选中行
  const selectedRows = ref<SysUserVO[]>([])

  // 搜索表单
  const searchForm = ref({
    userName: undefined,
    nickName: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: undefined
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    1: { type: 'success' as const, text: '启用' },
    0: { type: 'danger' as const, text: '禁用' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: number) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams: _resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'userName',
          label: '用户名',
          width: 120
        },
        {
          prop: 'nickName',
          label: '昵称',
          width: 120
        },
        {
          prop: 'sex',
          label: '性别',
          width: 80,
          formatter: (row) => (row.sex === '0' ? '男' : row.sex === '1' ? '女' : '未知')
        },
        { prop: 'phonenumber', label: '手机号', width: 130 },
        { prop: 'email', label: '邮箱', minWidth: 180 },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 170,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ]
    }
  })

  /**
   * 获取部门树数据
   */
  const loadDeptTree = async () => {
    try {
      const list = await fetchGetDeptTree()
      // 添加"全部用户"节点
      deptTreeData.value = [
        { id: 0, name: '全部用户', children: [] },
        ...(list || [])
      ]
    } catch (error) {
      console.error('获取部门树失败:', error)
    }
  }

  /**
   * 部门树过滤
   */
  const filterDeptNode = (value: string, data: any) => {
    if (!value) return true
    return data.name?.toLowerCase().includes(value.toLowerCase())
  }

  /**
   * 监听部门搜索关键字变化
   */
  watch(deptSearchKey, (val) => {
    deptTreeRef.value?.filter(val)
  })

  /**
   * 点击部门节点
   */
  const handleDeptClick = (data: any) => {
    selectedDeptId.value = data.id === 0 ? null : data.id
    // 更新搜索参数并刷新数据
    Object.assign(searchParams, { deptId: selectedDeptId.value })
    getData()
  }

  /**
   * 切换部门树折叠状态
   */
  const toggleTreeCollapse = () => {
    isTreeCollapsed.value = !isTreeCollapsed.value
  }

  /**
   * 搜索处理
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params, { deptId: selectedDeptId.value })
    getData()
  }

  /**
   * 重置搜索参数
   */
  const resetSearchParams = () => {
    _resetSearchParams()
    // 保留部门筛选
    if (selectedDeptId.value) {
      Object.assign(searchParams, { deptId: selectedDeptId.value })
    }
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: SysUserVO): void => {
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: SysUserVO): void => {
    ElMessageBox.confirm(`确定要删除用户 "${row.userName}" 吗？`, '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // TODO: 调用删除接口
      ElMessage.success('删除成功')
      getData()
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      getData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: SysUserVO[]): void => {
    selectedRows.value = selection
  }

  onMounted(() => {
    loadDeptTree()
  })
</script>

<style scoped>
  .tree-card :deep(.el-card__body) {
    flex: 1;
    min-height: 0;
    padding: 10px 2px 10px 10px;
    display: flex;
    flex-direction: column;
  }

  .dept-tree-node {
    display: flex;
    align-items: center;
    font-size: 14px;
  }
</style>
