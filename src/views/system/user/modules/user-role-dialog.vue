<!-- 用户分配角色弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    title="分配角色"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 提示信息 -->
    <div class="tip-box mb-5" :style="tipBoxStyle">
      <ArtSvgIcon icon="ri:information-line" class="mr-2 flex-shrink-0" :style="{ color: primaryColor }" />
      <span>拖拽操作：将左侧角色拖到右侧完成绑定，将右侧角色拖到左侧完成解绑</span>
    </div>

    <div class="flex gap-4 h-80">
      <!-- 左侧：可分配角色列表 -->
      <div class="flex-1 flex flex-col border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <div class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
          <span class="font-medium text-sm">可分配角色</span>
          <span class="text-gray-400 text-xs ml-2">({{ availableRoles.length }})</span>
        </div>
        <div
          ref="availableListRef"
          class="flex-1 overflow-auto p-2"
          @dragover.prevent
          @drop="handleDropToAvailable"
        >
          <div
            v-for="role in availableRoles"
            :key="role.id"
            class="role-item"
            draggable="true"
            @dragstart="handleDragStart($event, role, 'available')"
            @dragend="handleDragEnd"
          >
            <ArtSvgIcon icon="ri:shield-user-line" class="mr-2 text-gray-500" />
            <span class="flex-1 truncate">{{ role.roleName }}</span>
            <span class="text-xs text-gray-400">{{ role.roleKey }}</span>
          </div>
          <div v-if="availableRoles.length === 0" class="text-center text-gray-400 py-8">
            暂无可分配角色
          </div>
        </div>
      </div>

      <!-- 右侧：已绑定角色列表 -->
      <div class="flex-1 flex flex-col border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-600" :style="{ backgroundColor: primaryColorLight }">
          <span class="font-medium text-sm" :style="{ color: primaryColor }">已绑定角色</span>
          <span class="text-xs ml-2" :style="{ color: primaryColor, opacity: 0.7 }">({{ boundRoles.length }})</span>
        </div>
        <div
          ref="boundListRef"
          class="flex-1 overflow-auto p-2"
          @dragover.prevent
          @drop="handleDropToBound"
        >
          <div
            v-for="role in boundRoles"
            :key="role.id"
            class="role-item role-item-bound"
            draggable="true"
            @dragstart="handleDragStart($event, role, 'bound')"
            @dragend="handleDragEnd"
          >
            <ArtSvgIcon icon="ri:shield-check-line" class="mr-2" :style="{ color: primaryColor }" />
            <span class="flex-1 truncate">{{ role.roleName }}</span>
            <span class="text-xs text-gray-400">{{ role.roleKey }}</span>
          </div>
          <div v-if="boundRoles.length === 0" class="text-center text-gray-400 py-8">
            暂无已绑定角色
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
  import { fetchGetRoleOptions } from '@/api/system/role'
  import { fetchGetUserRoles, fetchUpdateUserRoles } from '@/api/system/user'
  import { useSettingStore } from '@/store/modules/setting'

  interface RoleItem {
    id: number
    roleName: string
    roleKey: string
  }

  interface Props {
    visible: boolean
    userId: number | null
    userName?: string
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    'submit': []
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

  // 所有角色列表
  const allRoles = ref<RoleItem[]>([])
  // 已绑定角色ID列表
  const boundRoleIds = ref<number[]>([])
  // 提交中
  const submitting = ref(false)

  // 可分配角色（排除已绑定的）
  const availableRoles = computed(() => {
    return allRoles.value.filter(role => !boundRoleIds.value.includes(role.id))
  })

  // 已绑定角色
  const boundRoles = computed(() => {
    return allRoles.value.filter(role => boundRoleIds.value.includes(role.id))
  })

  // 拖拽相关
  let draggedRole: RoleItem | null = null
  let dragSource: 'available' | 'bound' | null = null

  const handleDragStart = (event: DragEvent, role: RoleItem, source: 'available' | 'bound') => {
    draggedRole = role
    dragSource = source
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  const handleDragEnd = () => {
    draggedRole = null
    dragSource = null
  }

  // 拖到可分配列表（解绑）
  const handleDropToAvailable = () => {
    if (draggedRole && dragSource === 'bound') {
      boundRoleIds.value = boundRoleIds.value.filter(id => id !== draggedRole!.id)
    }
  }

  // 拖到已绑定列表（绑定）
  const handleDropToBound = () => {
    if (draggedRole && dragSource === 'available') {
      if (!boundRoleIds.value.includes(draggedRole.id)) {
        boundRoleIds.value.push(draggedRole.id)
      }
    }
  }

  // 加载数据
  const loadData = async () => {
    if (!props.userId) return
    
    try {
      // 获取所有角色
      const roles = await fetchGetRoleOptions()
      allRoles.value = (roles || []).map(r => ({
        id: r.id,
        roleName: r.roleName,
        roleKey: r.roleKey
      }))

      // 获取用户已绑定的角色
      const userRoles = await fetchGetUserRoles(props.userId)
      boundRoleIds.value = (userRoles || []).map(r => r.id)
    } catch (error) {
      console.error('加载角色数据失败:', error)
    }
  }

  // 提交
  const handleSubmit = async () => {
    if (!props.userId) return

    submitting.value = true
    try {
      await fetchUpdateUserRoles(props.userId, boundRoleIds.value)
      ElMessage.success('分配角色成功')
      emit('submit')
      handleClose()
    } catch (error) {
      console.error('分配角色失败:', error)
    } finally {
      submitting.value = false
    }
  }

  const handleClose = () => {
    dialogVisible.value = false
    boundRoleIds.value = []
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

  .role-item {
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

  .role-item:hover {
    background: var(--el-fill-color);
  }

  .role-item:active {
    cursor: grabbing;
  }

  .role-item-bound {
    background: v-bind(primaryColorLight);
  }

  .role-item-bound:hover {
    background: v-bind(primaryColorLight);
    filter: brightness(0.95);
  }
</style>
