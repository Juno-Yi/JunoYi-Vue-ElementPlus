<!-- 用户独立权限设置弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    title="设置独立权限"
    width="750px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 提示信息 -->
    <div class="tip-box mb-5" :style="tipBoxStyle">
      <ArtSvgIcon icon="ri:information-line" class="mr-2 flex-shrink-0" :style="{ color: primaryColor }" />
      <span>独立权限是直接赋予用户的特殊权限，优先级高于角色和部门权限</span>
    </div>

    <!-- 添加权限区域 -->
    <div class="add-perm-section mb-5">
      <div class="flex gap-3 items-center">
        <div class="flex-1">
          <div class="text-sm text-gray-500 mb-1.5">权限标识</div>
          <ElInput
            v-model="newPermission"
            placeholder="输入权限标识，如：system.user.view"
            clearable
            @keyup.enter="handleAddPermission"
          />
        </div>
        <div class="pt-6 ml-2">
          <ElButton type="primary" @click="handleAddPermission" :disabled="!newPermission.trim()">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            添加
          </ElButton>
        </div>
      </div>
    </div>

    <!-- 权限列表 -->
    <div class="perm-list-section">
      <div class="section-header mb-3">
        <span class="font-medium">已设置的独立权限</span>
        <span class="text-gray-400 text-sm ml-2">({{ permissionList.length }})</span>
      </div>
      
      <ElScrollbar height="320px">
        <div v-if="loading" class="text-center py-10 text-gray-400">
          <ElIcon class="is-loading mr-2"><Loading /></ElIcon>
          加载中...
        </div>
        
        <div v-else-if="permissionList.length === 0" class="text-center py-10 text-gray-400">
          <ArtSvgIcon icon="ri:shield-keyhole-line" class="text-4xl mb-2 opacity-50" />
          <div>暂无独立权限</div>
        </div>
        
        <TransitionGroup v-else name="perm-list" tag="div" class="perm-list">
          <div
            v-for="perm in permissionList"
            :key="perm.id"
            class="perm-item"
          >
            <div class="perm-info">
              <div class="perm-name">
                <ArtSvgIcon :icon="getPermIcon(perm.permission)" class="mr-2" :style="{ color: getPermColor(perm.permission) }" />
                <span class="font-mono">{{ perm.permission }}</span>
                <ElTag :type="getPermType(perm.permission)" size="small" class="ml-2">
                  {{ getPermLabel(perm.permission) }}
                </ElTag>
              </div>
            <div class="perm-meta">
                <span class="create-time">
                  创建于 {{ formatTime(perm.createTime) }}
                </span>
            </div>
            </div>
            <ElButton
              link
              type="danger"
              size="small"
              @click="handleDeletePermission(perm)"
            >
              <ArtSvgIcon icon="ri:delete-bin-line" />
            </ElButton>
          </div>
        </TransitionGroup>
      </ElScrollbar>
    </div>

    <template #footer>
      <ElButton @click="handleClose">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { 
    fetchGetUserPermissions, 
    fetchAddUserPermissions, 
    fetchDeleteUserPermission 
  } from '@/api/system/user'
  import { useSettingStore } from '@/store/modules/setting'

  type SysUserPermVO = Api.System.SysUserPermVO

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

  const tipBoxStyle = computed(() => ({
    backgroundColor: primaryColorLight.value,
    borderColor: primaryColor.value,
    color: primaryColor.value
  }))

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  // 状态
  const loading = ref(false)
  const permissionList = ref<SysUserPermVO[]>([])
  const newPermission = ref('')

  /**
   * 获取权限图标
   */
  const getPermIcon = (perm: string): string => {
    if (perm === '*') return 'ri:vip-crown-line'
    if (perm.includes('.ui.')) return 'ri:layout-line'
    if (perm.includes('.api.')) return 'ri:code-s-slash-line'
    if (perm.includes('.data.')) return 'ri:database-2-line'
    if (perm.endsWith('*')) return 'ri:folder-line'
    return 'ri:key-2-line'
  }

  /**
   * 获取权限颜色
   */
  const getPermColor = (perm: string): string => {
    if (perm === '*') return 'var(--el-color-warning)'
    if (perm.includes('.ui.')) return 'var(--el-color-primary)'
    if (perm.includes('.api.')) return 'var(--el-color-success)'
    if (perm.includes('.data.')) return 'var(--el-color-info)'
    return 'var(--el-text-color-secondary)'
  }

  /**
   * 获取权限类型
   */
  const getPermType = (perm: string): 'warning' | 'primary' | 'success' | 'info' => {
    if (perm === '*') return 'warning'
    if (perm.includes('.ui.')) return 'primary'
    if (perm.includes('.api.')) return 'success'
    if (perm.includes('.data.')) return 'info'
    return 'info'
  }

  /**
   * 获取权限标签
   */
  const getPermLabel = (perm: string): string => {
    if (perm === '*') return '超级'
    if (perm.endsWith('**') || perm.endsWith('*')) return '通配'
    if (perm.includes('.ui.')) return 'UI'
    if (perm.includes('.api.')) return 'API'
    if (perm.includes('.data.')) return '数据'
    return '其他'
  }

  // 格式化时间
  const formatTime = (time?: string): string => {
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

  // 加载数据
  const loadData = async () => {
    if (!props.userId) return
    
    loading.value = true
    try {
      const list = await fetchGetUserPermissions(props.userId)
      permissionList.value = list || []
    } catch (error) {
      console.error('加载用户独立权限失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 添加权限
  const handleAddPermission = async () => {
    const perm = newPermission.value.trim()
    if (!perm) {
      ElMessage.warning('请输入权限标识')
      return
    }

    // 检查是否已存在
    if (permissionList.value.some(p => p.permission === perm)) {
      ElMessage.warning('该权限已存在')
      return
    }

    if (!props.userId) return

    try {
      // 增量添加权限
      await fetchAddUserPermissions(props.userId, [perm])
      
      ElMessage.success('添加权限成功')
      newPermission.value = ''
      await loadData()
    } catch (error) {
      console.error('添加权限失败:', error)
    }
  }

  // 删除权限
  const handleDeletePermission = async (perm: SysUserPermVO) => {
    if (!props.userId) return

    try {
      await ElMessageBox.confirm(
        `确定删除权限「${perm.permission}」吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await fetchDeleteUserPermission(props.userId, perm.id)
      ElMessage.success('删除成功')
      await loadData()
    } catch {
      // 用户取消
    }
  }

  const handleClose = () => {
    dialogVisible.value = false
    newPermission.value = ''
    permissionList.value = []
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

  .add-perm-section {
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }

  .section-header {
    display: flex;
    align-items: center;
  }

  .perm-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .perm-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    transition: all 0.2s;
  }

  .perm-item:hover {
    background: var(--el-fill-color);
  }

  .perm-info {
    flex: 1;
    min-width: 0;
  }

  .perm-name {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
  }

  .perm-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .create-time {
    color: var(--el-text-color-placeholder);
  }

  /* 列表动画 */
  .perm-list-enter-active,
  .perm-list-leave-active {
    transition: all 0.3s ease;
  }

  .perm-list-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }

  .perm-list-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
</style>
