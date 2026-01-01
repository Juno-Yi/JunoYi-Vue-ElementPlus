<!-- 部门管理页面 -->
<template>
  <div class="dept-page art-full-height">
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
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton v-permission="'system.ui.dept.button.add'" @click="handleAddDept" v-ripple>
            添加部门
          </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="filteredTableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      />

      <!-- 部门弹窗 -->
      <DeptDialog
        v-model:visible="dialogVisible"
        :editData="editData"
        :defaultParentId="parentId"
        @success="getDeptList"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { usePermission } from '@/hooks/core/usePermission'
  import DeptDialog from './modules/dept-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import { fetchGetDeptTree, fetchDeleteDept } from '@/api/system/department'

  defineOptions({ name: 'Department' })

  type DeptVO = Api.System.DeptVO

  // 权限
  const { hasPermission } = usePermission()

  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const editData = ref<Api.System.DeptVO | null>(null)
  const parentId = ref<number>(0)

  // 搜索相关
  const initialSearchState = {
    name: '',
    status: null as number | null
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  // 状态选项
  const statusOptions = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 }
  ]

  const formItems = computed(() => [
    {
      label: '部门名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        options: statusOptions
      }
    }
  ])

  // 数据相关
  const tableData = ref<Api.System.DeptVO[]>([])

  onMounted(() => {
    getDeptList()
  })

  /**
   * 获取部门列表数据
   */
  const getDeptList = async (): Promise<void> => {
    loading.value = true
    try {
      const list = await fetchGetDeptTree()
      tableData.value = list || []
    } catch (error) {
      console.error('获取部门失败:', error)
    } finally {
      loading.value = false
    }
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

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      type: 'selection',
      width: 50,
      align: 'center'
    },
    {
      prop: 'name',
      label: '部门名称',
      width: 200,
      headerAlign: 'center'
    },
    {
      prop: 'leader',
      label: '负责人',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: DeptVO) => row.leader || '-'
    },
    {
      prop: 'phonenumber',
      label: '联系电话',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: DeptVO) => row.phonenumber || '-'
    },
    {
      prop: 'email',
      label: '邮箱',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: DeptVO) => row.email || '-'
    },
    {
      prop: 'sort',
      label: '排序',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: DeptVO) => row.sort ?? 0
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: DeptVO) => {
        const status = row.status ?? 1
        return h(ElTag, { type: status === 1 ? 'success' : 'danger', size: 'small' }, () => status === 1 ? '启用' : '禁用')
      }
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: DeptVO) => formatTime(row.createTime)
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: DeptVO) => formatTime(row.updateTime)
    },
    {
      prop: 'remark',
      label: '备注',
      minWidth: '200',
      headerAlign: 'center'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      fixed: 'right',
      formatter: (row: DeptVO) => {
        const buttons = []
        if (hasPermission('system.ui.dept.button.add')) {
          buttons.push(
            h(ArtButtonTable, {
              type: 'add',
              onClick: () => handleAddChildDept(row)
            })
          )
        }
        if (hasPermission('system.ui.dept.button.edit')) {
          buttons.push(
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => handleEditDept(row)
            })
          )
        }
        if (hasPermission('system.ui.dept.button.delete')) {
          buttons.push(
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => handleDeleteDept(row)
            })
          )
        }
        return buttons.length ? h('div', { style: 'text-align: center' }, buttons) : '-'
      }
    }
  ])

  /**
   * 深度克隆对象
   */
  const deepClone = <T,>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj) as T
    if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  /**
   * 搜索部门
   */
  const searchDept = (items: Api.System.DeptVO[]): Api.System.DeptVO[] => {
    const results: Api.System.DeptVO[] = []
    for (const item of items) {
      const searchName = appliedFilters.name?.toLowerCase().trim() || ''
      const searchStatus = appliedFilters.status
      const deptName = (item.name || '').toLowerCase()
      const nameMatch = !searchName || deptName.includes(searchName)
      const statusMatch = searchStatus === null || item.status === searchStatus

      if (item.children?.length) {
        const matchedChildren = searchDept(item.children)
        if (matchedChildren.length > 0) {
          const clonedItem = deepClone(item)
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (nameMatch && statusMatch) {
        results.push(deepClone(item))
      }
    }
    return results
  }

  // 过滤后的表格数据
  const filteredTableData = computed(() => {
    return searchDept(tableData.value)
  })

  /**
   * 重置搜索条件
   */
  const handleReset = (): void => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getDeptList()
  }

  /**
   * 执行搜索
   */
  const handleSearch = (): void => {
    Object.assign(appliedFilters, { ...formFilters })
  }

  /**
   * 刷新部门列表
   */
  const handleRefresh = (): void => {
    getDeptList()
  }

  /**
   * 添加部门
   */
  const handleAddDept = (): void => {
    editData.value = null
    parentId.value = 0
    dialogVisible.value = true
  }

  /**
   * 添加子部门
   */
  const handleAddChildDept = (row: Api.System.DeptVO): void => {
    editData.value = null
    parentId.value = row.id
    dialogVisible.value = true
  }

  /**
   * 编辑部门
   */
  const handleEditDept = (row: Api.System.DeptVO): void => {
    editData.value = row
    parentId.value = 0
    dialogVisible.value = true
  }

  /**
   * 删除部门
   */
  const handleDeleteDept = async (row: Api.System.DeptVO): Promise<void> => {
    const hasChildren = row.children && row.children.length > 0
    
    if (hasChildren) {
      ElMessageBox.alert(`部门「${row.name}」下有子部门，请先删除子部门后再删除`, '提示', {
        confirmButtonText: '知道了',
        type: 'warning'
      })
      return
    }
    
    try {
      await ElMessageBox.confirm(`确定要删除部门「${row.name}」吗？删除后无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await fetchDeleteDept(row.id)
      getDeptList()
    } catch {
      // 用户取消操作
    }
  }

  /**
   * 切换展开/收起所有部门
   */
  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && filteredTableData.value) {
        const processRows = (rows: Api.System.DeptVO[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(filteredTableData.value)
      }
    })
  }
</script>
