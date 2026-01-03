<!-- 权限组编辑弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑权限组' : '新增权限组'"
    width="680px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="权限组名称" prop="groupName">
            <ElInput v-model="formData.groupName" placeholder="请输入权限组名称" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="权限组编码" prop="groupCode">
            <ElInput 
              v-model="formData.groupCode" 
              placeholder="如：admin_group" 
              clearable 
              :disabled="isEdit"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="优先级" prop="priority">
            <ElInputNumber 
              v-model="formData.priority" 
              :min="0" 
              :max="999" 
              placeholder="优先级"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElRadioGroup v-model="formData.status">
              <ElRadio :value="1">启用</ElRadio>
              <ElRadio :value="0">禁用</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          placeholder="请输入权限组描述"
          :rows="2"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="权限列表" prop="permissions">
        <div class="permission-container">
          <!-- 添加权限输入框 -->
          <div class="permission-add">
            <ElInput
              v-model="newPermission"
              placeholder="输入权限标识符，回车添加"
              clearable
              @keyup.enter="addPermission"
            >
              <template #append>
                <ElButton @click="addPermission" :disabled="!newPermission.trim()">
                  添加
                </ElButton>
              </template>
            </ElInput>
          </div>

          <!-- 快捷模板 -->
          <div class="permission-templates">
            <span class="template-label">快捷添加：</span>
            <ElTag
              v-for="tpl in quickTemplates"
              :key="tpl.value"
              size="small"
              effect="plain"
              class="template-tag"
              @click="addQuickPermission(tpl.value)"
            >
              {{ tpl.label }}
            </ElTag>
          </div>

          <!-- 权限列表 -->
          <div class="permission-list" :class="{ 'has-items': formData.permissions.length > 0 }">
            <TransitionGroup name="permission">
              <div
                v-for="(perm, index) in formData.permissions"
                :key="perm"
                class="permission-item"
              >
                <ArtSvgIcon :icon="getPermIcon(perm)" class="permission-icon" :style="{ color: getPermColor(perm) }" />
                <span class="permission-text">{{ perm }}</span>
                <ElTag :type="getPermType(perm)" size="small" class="permission-type">
                  {{ getPermLabel(perm) }}
                </ElTag>
                <ElButton
                  link
                  size="small"
                  class="permission-remove"
                  @click="removePermission(index)"
                >
                  <ArtSvgIcon icon="ri:close-line" />
                </ElButton>
              </div>
            </TransitionGroup>
            <div v-if="formData.permissions.length === 0" class="permission-empty">
              <ArtSvgIcon icon="ri:key-2-line" class="empty-icon" />
              <span>暂无权限，请添加</span>
            </div>
          </div>
        </div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, ref, reactive, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { fetchAddPermissionGroup, fetchUpdatePermissionGroup } from '@/api/system/permission'

  type PermissionGroupVO = Api.System.PermissionGroupVO

  interface Props {
    visible: boolean
    editData?: PermissionGroupVO | null
  }

  const props = withDefaults(defineProps<Props>(), {
    editData: null
  })

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    'success': []
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const isEdit = computed(() => !!props.editData?.id)

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const newPermission = ref('')

  // 快捷模板
  const quickTemplates = [
    { label: '超级权限', value: '*' },
    { label: '系统模块', value: 'system.*' },
    { label: '菜单查看', value: 'system.ui.menu.view' },
    { label: '用户查看', value: 'system.ui.user.view' },
    { label: '角色查看', value: 'system.ui.role.view' },
    { label: '部门查看', value: 'system.ui.dept.view' }
  ]

  const formData = reactive({
    id: undefined as number | undefined,
    groupName: '',
    groupCode: '',
    parentId: undefined as number | undefined,
    priority: 0,
    permissions: [] as string[],
    description: '',
    status: 1
  })

  const formRules: FormRules = {
    groupName: [
      { required: true, message: '请输入权限组名称', trigger: 'blur' },
      { max: 50, message: '名称不能超过50个字符', trigger: 'blur' }
    ],
    groupCode: [
      { required: true, message: '请输入权限组编码', trigger: 'blur' },
      { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '编码只能包含字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
    ],
    status: [
      { required: true, message: '请选择状态', trigger: 'change' }
    ]
  }

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
  const getPermType = (perm: string): 'warning' | 'primary' | 'success' | 'info' | '' => {
    if (perm === '*') return 'warning'
    if (perm.includes('.ui.')) return 'primary'
    if (perm.includes('.api.')) return 'success'
    if (perm.includes('.data.')) return 'info'
    return ''
  }

  /**
   * 获取权限标签
   */
  const getPermLabel = (perm: string): string => {
    if (perm === '*') return '超级'
    if (perm.endsWith('*')) return '通配'
    if (perm.includes('.ui.')) return 'UI'
    if (perm.includes('.api.')) return 'API'
    if (perm.includes('.data.')) return '数据'
    return '其他'
  }

  /**
   * 添加权限
   */
  const addPermission = () => {
    const perm = newPermission.value.trim()
    if (!perm) return
    
    if (formData.permissions.includes(perm)) {
      ElMessage.warning('该权限已存在')
      return
    }
    if (!/^[a-zA-Z*][a-zA-Z0-9._*-]*$/.test(perm)) {
      ElMessage.warning('权限格式不正确')
      return
    }
    formData.permissions.push(perm)
    newPermission.value = ''
  }

  /**
   * 快捷添加权限
   */
  const addQuickPermission = (perm: string) => {
    if (formData.permissions.includes(perm)) {
      ElMessage.warning('该权限已存在')
      return
    }
    formData.permissions.push(perm)
  }

  /**
   * 移除权限
   */
  const removePermission = (index: number) => {
    formData.permissions.splice(index, 1)
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitting.value = true

      const data: Api.System.PermissionGroupDTO = {
        groupName: formData.groupName,
        groupCode: formData.groupCode,
        parentId: formData.parentId,
        priority: formData.priority,
        permissions: formData.permissions,
        description: formData.description,
        status: formData.status
      }

      if (isEdit.value) {
        data.id = formData.id
        await fetchUpdatePermissionGroup(data)
      } else {
        await fetchAddPermissionGroup(data)
      }

      emit('success')
      handleClose()
    } catch {
      // 校验失败或请求失败
    } finally {
      submitting.value = false
    }
  }

  /**
   * 关闭弹窗
   */
  const handleClose = () => {
    dialogVisible.value = false
    formRef.value?.resetFields()
    Object.assign(formData, {
      id: undefined,
      groupName: '',
      groupCode: '',
      parentId: undefined,
      priority: 0,
      permissions: [],
      description: '',
      status: 1
    })
    newPermission.value = ''
  }

  /**
   * 监听编辑数据变化
   */
  watch(() => props.visible, (val) => {
    if (val && props.editData) {
      Object.assign(formData, {
        id: props.editData.id,
        groupName: props.editData.groupName,
        groupCode: props.editData.groupCode,
        parentId: props.editData.parentId,
        priority: props.editData.priority ?? 0,
        permissions: [...(props.editData.permissions || [])],
        description: props.editData.description || '',
        status: props.editData.status ?? 1
      })
    }
  })
</script>

<style scoped>
  .permission-container {
    width: 100%;
  }

  .permission-add {
    margin-bottom: 10px;
  }

  .permission-templates {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
    padding: 8px 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .template-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-right: 4px;
  }

  .template-tag {
    cursor: pointer;
    transition: all 0.2s;
  }

  .template-tag:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    color: var(--el-color-primary);
  }

  .permission-list {
    min-height: 120px;
    max-height: 220px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 8px;
  }

  .permission-list.has-items {
    background: var(--el-fill-color-lighter);
  }

  .permission-item {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    margin-bottom: 6px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    transition: all 0.2s;
  }

  .permission-item:last-child {
    margin-bottom: 0;
  }

  .permission-item:hover {
    border-color: var(--el-color-primary-light-5);
  }

  .permission-item:hover .permission-remove {
    opacity: 1;
  }

  .permission-icon {
    margin-right: 8px;
    flex-shrink: 0;
    font-size: 15px;
  }

  .permission-text {
    flex: 1;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 12px;
    color: var(--el-text-color-primary);
    word-break: break-all;
  }

  .permission-type {
    flex-shrink: 0;
    margin: 0 8px;
  }

  .permission-remove {
    opacity: 0;
    transition: opacity 0.2s;
    color: var(--el-text-color-placeholder);
  }

  .permission-remove:hover {
    color: var(--el-color-danger);
  }

  .permission-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: var(--el-text-color-placeholder);
    font-size: 13px;
  }

  .empty-icon {
    font-size: 28px;
    margin-bottom: 8px;
    opacity: 0.5;
  }

  /* 动画 */
  .permission-enter-active,
  .permission-leave-active {
    transition: all 0.25s ease;
  }

  .permission-enter-from {
    opacity: 0;
    transform: translateX(-16px);
  }

  .permission-leave-to {
    opacity: 0;
    transform: translateX(16px);
  }
</style>
