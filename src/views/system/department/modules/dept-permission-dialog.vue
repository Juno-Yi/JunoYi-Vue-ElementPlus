<!-- 部门分配权限组弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    title="分配权限组"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 提示信息 -->
    <div class="tip-box mb-5" :style="tipBoxStyle">
      <ArtSvgIcon icon="ri:information-line" class="mr-2 flex-shrink-0" :style="{ color: primaryColor }" />
      <span>操作方式：拖拽左侧权限组到右侧完成绑定，点击右侧权限组的 × 按钮或拖回左侧完成解绑</span>
    </div>

    <div class="flex gap-4 h-80">
      <!-- 左侧：可分配权限组列表 -->
      <div class="flex-1 flex flex-col border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <div class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
          <span class="font-medium text-sm">可分配权限组</span>
          <span class="text-gray-400 text-xs ml-2">({{ availableGroups.length }})</span>
        </div>
        <div
          ref="availableListRef"
          class="flex-1 overflow-auto p-2"
          @dragover.prevent
          @drop="handleDropToAvailable"
        >
          <div
            v-for="group in availableGroups"
            :key="group.id"
            class="perm-item"
            draggable="true"
            @dragstart="handleDragStart($event, group, 'available')"
            @dragend="handleDragEnd"
          >
            <ArtSvgIcon icon="ri:folder-shield-line" class="mr-2 text-gray-500" />
            <span class="flex-1 truncate">{{ group.groupName }}</span>
            <ElTag v-if="isSuperGroup(group)" type="warning" size="small" effect="light">超级</ElTag>
            <span v-else class="text-xs text-gray-400">{{ group.groupCode }}</span>
          </div>
          <div v-if="availableGroups.length === 0" class="text-center text-gray-400 py-8">
            暂无可分配权限组
          </div>
        </div>
      </div>

      <!-- 右侧：已绑定权限组列表 -->
      <div class="flex-1 flex flex-col border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-600" :style="{ backgroundColor: primaryColorLight }">
          <span class="font-medium text-sm" :style="{ color: primaryColor }">已绑定权限组</span>
          <span class="text-xs ml-2" :style="{ color: primaryColor, opacity: 0.7 }">({{ boundGroups.length }})</span>
        </div>
        <div
          ref="boundListRef"
          class="flex-1 overflow-auto p-2"
          @dragover.prevent
          @drop="handleDropToBound"
        >
          <div
            v-for="group in boundGroups"
            :key="group.id"
            class="perm-item perm-item-bound"
            draggable="true"
            @dragstart="handleDragStart($event, group, 'bound')"
            @dragend="handleDragEnd"
          >
            <ArtSvgIcon icon="ri:folder-shield-2-line" class="mr-2" :style="{ color: primaryColor }" />
            <span class="flex-1 truncate">{{ group.groupName }}</span>
            <ElTag v-if="isSuperGroup(group)" type="warning" size="small" effect="light" class="mr-2">超级</ElTag>
            <span v-else class="text-xs text-gray-400 mr-2">{{ group.groupCode }}</span>
            <ElButton 
              link 
              size="small" 
              class="remove-btn"
              @click.stop="removeGroup(group)"
            >
              <ArtSvgIcon icon="ri:close-line" class="text-gray-400 hover:text-red-500" />
            </ElButton>
          </div>
          <div v-if="boundGroups.length === 0" class="text-center text-gray-400 py-8">
            暂无已绑定权限组
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { fetchGetPermissionGroupOptions } from '@/api/system/permission'
  import { fetchGetDeptPermissionGroups, fetchUpdateDeptPermissionGroups } from '@/api/system/department'
  import { useSettingStore } from '@/store/modules/setting'

  type PermissionGroupVO = Api.System.PermissionGroupVO
  type DeptVO = Api.System.DeptVO

  interface Props {
    visible: boolean
    deptData?: DeptVO | null
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    'success': []
  }>()

  const settingStore = useSettingStore()

  // 主题色
  const primaryColor = computed(() => settingStore.systemThemeColor || '#409eff')
  const primaryColorLight = computed(() => {
    const hex = primaryColor.value.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, 0.1)`
  })

  // 提示框样式
  const tipBoxStyle = computed(() => ({
    backgroundColor: primaryColorLight.value,
    borderColor: primaryColor.value,
    color: primaryColor.value
  }))

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  // 所有权限组列表
  const allGroups = ref<PermissionGroupVO[]>([])
  // 已绑定权限组ID列表
  const boundGroupIds = ref<number[]>([])
  // 提交中
  const submitting = ref(false)

  // 可分配权限组（排除已绑定的）
  const availableGroups = computed(() => {
    return allGroups.value.filter(g => !boundGroupIds.value.includes(g.id))
  })

  // 已绑定权限组
  const boundGroups = computed(() => {
    return allGroups.value.filter(g => boundGroupIds.value.includes(g.id))
  })

  // 判断是否是超级权限组
  const isSuperGroup = (group: PermissionGroupVO) => {
    return group.permissions?.length === 1 && group.permissions[0] === '*'
  }

  // 拖拽相关
  let draggedGroup: PermissionGroupVO | null = null
  let dragSource: 'available' | 'bound' | null = null

  const handleDragStart = (event: DragEvent, group: PermissionGroupVO, source: 'available' | 'bound') => {
    draggedGroup = group
    dragSource = source
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  const handleDragEnd = () => {
    draggedGroup = null
    dragSource = null
  }

  // 拖到可分配列表（解绑）
  const handleDropToAvailable = () => {
    if (draggedGroup && dragSource === 'bound') {
      boundGroupIds.value = boundGroupIds.value.filter(id => id !== draggedGroup!.id)
    }
  }

  // 拖到已绑定列表（绑定）
  const handleDropToBound = () => {
    if (draggedGroup && dragSource === 'available') {
      if (!boundGroupIds.value.includes(draggedGroup.id)) {
        boundGroupIds.value.push(draggedGroup.id)
      }
    }
  }

  // 移除权限组（点击删除按钮）
  const removeGroup = (group: PermissionGroupVO) => {
    boundGroupIds.value = boundGroupIds.value.filter(id => id !== group.id)
  }

  // 加载数据
  const loadData = async () => {
    if (!props.deptData?.id) return
    
    try {
      // 获取所有权限组
      const groups = await fetchGetPermissionGroupOptions()
      allGroups.value = groups || []

      // 获取部门已绑定的权限组
      const deptGroups = await fetchGetDeptPermissionGroups(props.deptData.id)
      boundGroupIds.value = (deptGroups || []).map(g => g.id)
    } catch (error) {
      console.error('加载权限组数据失败:', error)
    }
  }

  // 提交
  const handleSubmit = async () => {
    if (!props.deptData?.id) return

    submitting.value = true
    try {
      await fetchUpdateDeptPermissionGroups(props.deptData.id, boundGroupIds.value)
      ElMessage.success('分配权限组成功')
      emit('success')
      handleClose()
    } catch (error) {
      console.error('分配权限组失败:', error)
    } finally {
      submitting.value = false
    }
  }

  const handleClose = () => {
    dialogVisible.value = false
    boundGroupIds.value = []
  }

  watch(() => props.visible, (val) => {
    if (val) {
      loadData()
    }
  })
</script>

<style scoped>
  .tip-box {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 14px;
  }

  .perm-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 6px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
    cursor: grab;
    transition: all 0.2s;
    user-select: none;
  }

  .perm-item:hover {
    background: var(--el-fill-color);
  }

  .perm-item:active {
    cursor: grabbing;
  }

  .perm-item-bound {
    background: v-bind(primaryColorLight);
  }

  .perm-item-bound:hover {
    background: v-bind(primaryColorLight);
    filter: brightness(0.95);
  }

  .perm-item-bound:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn {
    opacity: 0;
    transition: opacity 0.2s;
    padding: 2px;
  }
</style>
