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
      <span>独立权限是直接赋予用户的特殊权限，优先级高于角色和部门权限，支持设置过期时间</span>
    </div>

    <!-- 添加权限区域 -->
    <div class="add-perm-section mb-5">
      <div class="flex gap-3 items-end">
        <ElFormItem label="权限标识" class="flex-1 mb-0">
          <ElInput
            v-model="newPermission"
            placeholder="输入权限标识，如：system.user.view"
            clearable
            @keyup.enter="handleAddPermission"
          />
        </ElFormItem>
        <ElFormItem label="过期时间" class="w-52 mb-0">
          <ElDatePicker
            v-model="newExpireTime"
            type="datetime"
            placeholder="永不过期"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :disabled-date="disabledDate"
            clearable
          />
        </ElFormItem>
        <ElButton type="primary" @click="handleAddPermission" :disabled="!newPermission.trim()">
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          添加
        </ElButton>
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
            :class="{ 'perm-expired': isExpired(perm.expireTime) }"
          >
            <div class="perm-info">
              <div class="perm-name">
                <ArtSvgIcon icon="ri:key-2-line" class="mr-2 text-gray-500" />
                <span class="font-mono">{{ perm.permission }}</span>
              </div>
              <div class="perm-meta">
                <span v-if="perm.expireTime" class="expire-tag" :class="getExpireClass(perm.expireTime)">
                  <ArtSvgIcon :icon="isExpired(perm.expireTime) ? 'ri:time-line' : 'ri:calendar-line'" class="mr-1" />
                  {{ formatExpireTime(perm.expireTime) }}
                </span>
                <span v-else class="expire-tag permanent">
                  <ArtSvgIcon icon="ri:infinity-line" class="mr-1" />
                  永久有效
                </span>
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
    fetchUpdateUserPermissions, 
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
  const newExpireTime = ref<string | null>(null)

  // 禁用过去的日期
  const disabledDate = (time: Date) => {
    return time.getTime() < Date.now() - 8.64e7
  }

  // 判断是否过期
  const isExpired = (expireTime?: string | null): boolean => {
    if (!expireTime) return false
    return new Date(expireTime).getTime() < Date.now()
  }

  // 获取过期时间样式类
  const getExpireClass = (expireTime?: string | null): string => {
    if (!expireTime) return 'permanent'
    if (isExpired(expireTime)) return 'expired'
    
    const diff = new Date(expireTime).getTime() - Date.now()
    const days = diff / (1000 * 60 * 60 * 24)
    if (days <= 7) return 'expiring-soon'
    return 'normal'
  }

  // 格式化过期时间
  const formatExpireTime = (time?: string | null): string => {
    if (!time) return '永久有效'
    
    const expireDate = new Date(time)
    if (isExpired(time)) {
      return `已过期 (${formatTime(time)})`
    }
    
    const diff = expireDate.getTime() - Date.now()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      return hours > 0 ? `${hours}小时后过期` : '即将过期'
    } else if (days <= 7) {
      return `${days}天后过期`
    }
    
    return formatTime(time) + ' 过期'
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
      // 获取当前所有权限，加上新权限
      const permissions = [...permissionList.value.map(p => p.permission), perm]
      await fetchUpdateUserPermissions(props.userId, {
        permissions,
        expireTime: newExpireTime.value
      })
      
      ElMessage.success('添加权限成功')
      newPermission.value = ''
      newExpireTime.value = null
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
    newExpireTime.value = null
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

  .perm-item.perm-expired {
    opacity: 0.6;
    background: var(--el-color-danger-light-9);
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

  .expire-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .expire-tag.permanent {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }

  .expire-tag.normal {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  .expire-tag.expiring-soon {
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
  }

  .expire-tag.expired {
    background: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
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
