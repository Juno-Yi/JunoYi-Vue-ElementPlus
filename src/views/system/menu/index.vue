<!-- 菜单管理页面 -->
<template>
  <div class="menu-page art-full-height">
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
          <ElButton v-permission="'system.ui.menu.button.add'" @click="handleAddMenu" v-ripple> 添加菜单 </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

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

      <!-- 菜单弹窗 -->
      <MenuDialog
        v-model:visible="dialogVisible"
        :editData="editData"
        @success="getMenuList"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { usePermission } from '@/hooks/core/usePermission'
  import MenuDialog from './modules/menu-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import { fetchMenuTree } from '@/api/system/menu'

  defineOptions({ name: 'Menus' })

  // 权限
  const { hasPermission } = usePermission()

  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const editData = ref<Api.System.MenuVO | null>(null)

  // 搜索相关
  const initialSearchState = {
    name: '',
    route: '',
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
      label: '菜单名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '路由地址',
      key: 'route',
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
  const tableData = ref<Api.System.MenuVO[]>([])

  onMounted(() => {
    getMenuList()
  })

  /**
   * 获取菜单列表数据
   */
  const getMenuList = async (): Promise<void> => {
    loading.value = true
    try {
      const list = await fetchMenuTree()
      tableData.value = list || []
    } catch (error) {
      console.error('获取菜单失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取菜单类型标签颜色
   */
  const getMenuTypeTag = (row: Api.System.MenuVO): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    // 0目录 1菜单
    if (row.menuType === 0) return 'info'
    if (row.isIframe === 1) return 'success'
    if (row.link) return 'warning'
    return 'primary'
  }

  /**
   * 获取菜单类型文本
   */
  const getMenuTypeText = (row: Api.System.MenuVO): string => {
    // 0目录 1菜单
    if (row.menuType === 0) return '目录'
    if (row.isIframe === 1) return '内嵌'
    if (row.link && row.menuType === 1) return '外链'
    return '菜单'
  }

  /**
   * 格式化时间（年-月-日）
   */
  const formatTime = (time: string | undefined): string => {
    if (!time) return '-'
    const date = new Date(time)
    if (isNaN(date.getTime())) return '-'
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'title',
      label: '菜单名称',
      minWidth: 180,
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => formatMenuTitle(row.title) || '-'
    },
    {
      prop: 'icon',
      label: '菜单图标',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => {
        if (!row.icon) return '-'
        return h(ArtSvgIcon, { icon: row.icon, style: 'font-size: 18px' })
      }
    },
    {
      prop: 'menuType',
      label: '菜单类型',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => {
        return h(ElTag, { type: getMenuTypeTag(row), size: 'small' }, () => getMenuTypeText(row))
      }
    },
    {
      prop: 'sort',
      label: '排序',
      width: 60,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => row.sort ?? 0
    },
    {
      prop: 'path',
      label: '路由',
      minWidth: 160,
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => {
        if (row.menuType === 2) return '-'
        return row.link || row.path || '-'
      }
    },
    {
      prop: 'component',
      label: '组件',
      minWidth: 100,
      formatter: (row: Api.System.MenuVO) => {
        return row.component || '-'
      }
    },
    {
      prop: 'permission',
      label: '权限标识符',
      minWidth: 140,
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => row.permission || '-'
    },
    {
      prop: 'isHide',
      label: '显示',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => {
        const isHide = row.isHide ?? 1
        return h(ElTag, { type: isHide === 1 ? 'danger' : 'success', size: 'small' }, () => isHide === 1 ? '隐藏' : '显示')
      }
    },
    {
      prop: 'status',
      label: '状态',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => {
        const status = row.status ?? 1
        return h(ElTag, { type: status === 1 ? 'success' : 'danger', size: 'small' }, () => status === 1 ? '启用' : '禁用')
      }
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 170,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => formatTime(row.createTime)
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      width: 170,
      align: 'center',
      headerAlign: 'center',
      formatter: (row: Api.System.MenuVO) => formatTime(row.updateTime)
    },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      fixed: 'right',
      formatter: (row: Api.System.MenuVO) => {
        const buttons = []
        if (hasPermission('system.ui.menu.button.edit')) {
          buttons.push(
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => handleEditMenu(row)
            })
          )
        }
        if (hasPermission('system.ui.menu.button.delete')) {
          buttons.push(
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => handleDeleteMenu(row)
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
   * 搜索菜单
   */
  const searchMenu = (items: Api.System.MenuVO[]): Api.System.MenuVO[] => {
    const results: Api.System.MenuVO[] = []
    for (const item of items) {
      const searchName = appliedFilters.name?.toLowerCase().trim() || ''
      const searchRoute = appliedFilters.route?.toLowerCase().trim() || ''
      const searchStatus = appliedFilters.status
      const menuTitle = formatMenuTitle(item.title || '').toLowerCase()
      const menuPath = (item.path || '').toLowerCase()
      const nameMatch = !searchName || menuTitle.includes(searchName)
      const routeMatch = !searchRoute || menuPath.includes(searchRoute)
      const statusMatch = searchStatus === null || item.status === searchStatus

      if (item.children?.length) {
        const matchedChildren = searchMenu(item.children)
        if (matchedChildren.length > 0) {
          const clonedItem = deepClone(item)
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (nameMatch && routeMatch && statusMatch) {
        results.push(deepClone(item))
      }
    }
    return results
  }

  // 过滤后的表格数据
  const filteredTableData = computed(() => {
    return searchMenu(tableData.value)
  })

  /**
   * 重置搜索条件
   */
  const handleReset = (): void => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getMenuList()
  }

  /**
   * 执行搜索
   */
  const handleSearch = (): void => {
    Object.assign(appliedFilters, { ...formFilters })
  }

  /**
   * 刷新菜单列表
   */
  const handleRefresh = (): void => {
    getMenuList()
  }

  /**
   * 添加菜单
   */
  const handleAddMenu = (): void => {
    editData.value = null
    dialogVisible.value = true
  }

  /**
   * 编辑菜单
   */
  const handleEditMenu = (row: Api.System.MenuVO): void => {
    editData.value = row
    dialogVisible.value = true
  }

  /**
   * 删除菜单
   */
  const handleDeleteMenu = async (row: Api.System.MenuVO): Promise<void> => {
    const title = formatMenuTitle(row.title)
    try {
      await ElMessageBox.confirm(`确定要删除菜单「${title}」吗？删除后无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // TODO: 调用删除API
      ElMessage.success('删除成功')
      getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  /**
   * 切换展开/收起所有菜单
   */
  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && filteredTableData.value) {
        const processRows = (rows: Api.System.MenuVO[]) => {
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
