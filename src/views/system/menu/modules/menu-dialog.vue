<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="860px"
    align-center
    class="menu-dialog"
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :span="width > 640 ? 12 : 24"
      :gutter="20"
      label-width="100px"
      :show-reset="false"
      :show-submit="false"
    >
      <template #menuType>
        <ElRadioGroup v-model="form.menuType" :disabled="isEdit">
          <ElRadioButton :value="1">菜单</ElRadioButton>
          <ElRadioButton :value="0">目录</ElRadioButton>
        </ElRadioGroup>
      </template>
    </ArtForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { ElIcon, ElTooltip } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import { useWindowSize } from '@vueuse/core'
  import { addMenu, updateMenu } from '@/api/system/menu'

  const { width } = useWindowSize()

  /**
   * 创建带 tooltip 的表单标签
   */
  const createLabelTooltip = (label: string, tooltip: string) => {
    return () =>
      h('span', { class: 'flex items-center' }, [
        h('span', label),
        h(
          ElTooltip,
          { content: tooltip, placement: 'top' },
          () => h(ElIcon, { class: 'ml-0.5 cursor-help' }, () => h(QuestionFilled))
        )
      ])
  }

  interface Props {
    visible: boolean
    editData?: Api.System.MenuVO | null
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    editData: null
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()
  const isEdit = ref(false)
  const submitting = ref(false)
  const isExternalLink = ref(false) // 外链模式

  // 表单数据
  const form = reactive<Api.System.MenuDTO>({
    menuType: 1,
    parentId: 0,
    name: '',
    path: '',
    component: '',
    title: '',
    icon: '',
    sort: 1,
    isHide: 0,
    isHideTab: 0,
    keepAlive: 1,
    isIframe: 0,
    link: '',
    isFullPage: 0,
    fixedTab: 0,
    activePath: '',
    showBadge: 0,
    showTextBadge: '',
    permission: '',
    status: 1,
    remark: ''
  })

  // 动态校验规则
  const rules = computed<FormRules>(() => ({
    title: [
      { required: true, message: `请输入${typeLabel.value}名称`, trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    path: isExternalLink.value ? [] : [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    link: isExternalLink.value ? [{ required: true, message: '请输入外链地址', trigger: 'blur' }] : [],
    name: [{ required: true, message: '请输入路由名称', trigger: 'blur' }]
  }))

  // Switch 组件的 span
  const switchSpan = computed(() => (width.value < 640 ? 12 : 6))

  // 是否是目录类型
  const isDirectory = computed(() => form.menuType === 0)

  // 类型文本
  const typeLabel = computed(() => isDirectory.value ? '目录' : '菜单')

  /**
   * 表单项配置
   */
  const formItems = computed<FormItem[]>(() => {
    // 目录类型：简化表单
    if (isDirectory.value) {
      return [
        { label: '类型', key: 'menuType', span: 24 },
        { label: '目录名称', key: 'title', type: 'input', props: { placeholder: '请输入目录名称' } },
        {
          label: createLabelTooltip(
            '路由地址',
            '一级目录：以 / 开头的绝对路径（如 /system）\n二级及以下：相对路径（如 user）'
          ),
          key: 'path',
          type: 'input',
          props: { placeholder: '如：/system 或 user' }
        },
        { label: '图标', key: 'icon', type: 'input', props: { placeholder: '如：ri:user-line' } },
        {
          label: '排序',
          key: 'sort',
          type: 'number',
          props: { min: 0, controlsPosition: 'right', style: { width: '100%' } }
        },
        { label: '状态', key: 'status', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } },
        { label: '隐藏菜单', key: 'isHide', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } }
      ]
    }

    // 菜单类型：完整表单
    const items: FormItem[] = [
      { label: '类型', key: 'menuType', span: 24 },
      { label: '菜单名称', key: 'title', type: 'input', props: { placeholder: '请输入菜单名称' } },
      { label: '外链模式', key: 'isExternalLink', type: 'switch', span: switchSpan.value, props: { activeValue: true, inactiveValue: false } }
    ]

    // 外链模式：显示外链地址，路由地址非必填
    if (isExternalLink.value) {
      items.push(
        {
          label: '外链地址',
          key: 'link',
          type: 'input',
          props: { placeholder: '如：https://www.example.com' }
        },
        {
          label: createLabelTooltip('路由地址', '外链模式下可选填，用于生成唯一路由'),
          key: 'path',
          type: 'input',
          props: { placeholder: '可选，如：external-link' }
        }
      )
    } else {
      items.push(
        {
          label: createLabelTooltip(
            '路由地址',
            '一级菜单：以 / 开头的绝对路径（如 /dashboard）\n二级及以下：相对路径（如 console、user）'
          ),
          key: 'path',
          type: 'input',
          props: { placeholder: '如：/dashboard 或 console' }
        }
      )
    }

    items.push(
      {
        label: createLabelTooltip('路由名称', '路由的唯一标识，用于 keep-alive 缓存'),
        key: 'name',
        type: 'input',
        props: { placeholder: '如：User' }
      },
      {
        label: createLabelTooltip(
          '组件路径',
          '具体页面：填写组件路径（如 /system/user）\n父级菜单：填写 /index/index'
        ),
        key: 'component',
        type: 'input',
        props: { placeholder: '如：/system/user' }
      },
      { label: '图标', key: 'icon', type: 'input', props: { placeholder: '如：ri:user-line' } },
      {
        label: '权限标识',
        key: 'permission',
        type: 'input',
        props: { placeholder: '如：system.menu.add' }
      },
      {
        label: '排序',
        key: 'sort',
        type: 'number',
        props: { min: 0, controlsPosition: 'right', style: { width: '100%' } }
      },
      {
        label: '文本徽章',
        key: 'showTextBadge',
        type: 'input',
        props: { placeholder: '如：New、Hot' }
      },
      {
        label: createLabelTooltip(
          '激活路径',
          '用于详情页等隐藏菜单，指定高亮显示的父级菜单路径'
        ),
        key: 'activePath',
        type: 'input',
        props: { placeholder: '如：/system/user' }
      },
      { label: '状态', key: 'status', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } },
      { label: '页面缓存', key: 'keepAlive', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } },
      { label: '隐藏菜单', key: 'isHide', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } },
      { label: '是否内嵌', key: 'isIframe', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } },
      { label: '显示徽章', key: 'showBadge', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } },
      { label: '固定标签', key: 'fixedTab', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } },
      { label: '标签隐藏', key: 'isHideTab', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } },
      { label: '全屏页面', key: 'isFullPage', type: 'switch', span: switchSpan.value, props: { activeValue: 1, inactiveValue: 0 } }
    )

    return items
  })

  const dialogTitle = computed(() => {
    const type = form.menuType === 0 ? '目录' : '菜单'
    return isEdit.value ? `编辑${type}` : `新建${type}`
  })

  /**
   * 重置表单数据
   */
  const resetForm = (): void => {
    formRef.value?.reset()
    Object.assign(form, {
      id: undefined,
      menuType: 1,
      parentId: 0,
      name: '',
      path: '',
      component: '',
      title: '',
      icon: '',
      sort: 1,
      isHide: 0,
      isHideTab: 0,
      keepAlive: 1,
      isIframe: 0,
      link: '',
      isFullPage: 0,
      fixedTab: 0,
      activePath: '',
      showBadge: 0,
      showTextBadge: '',
      permission: '',
      status: 1,
      remark: ''
    })
  }

  /**
   * 加载表单数据（编辑模式）
   */
  const loadFormData = (): void => {
    if (!props.editData) return

    isEdit.value = true
    const row = props.editData

    Object.assign(form, {
      id: row.id,
      menuType: row.menuType ?? 1,
      parentId: row.parentId ?? 0,
      name: row.name || '',
      path: row.path || '',
      component: row.component || '',
      title: row.title || '',
      icon: row.icon || '',
      sort: row.sort ?? 1,
      isHide: row.isHide ?? 0,
      isHideTab: row.isHideTab ?? 0,
      keepAlive: row.keepAlive ?? 1,
      isIframe: row.isIframe ?? 0,
      link: row.link || '',
      isFullPage: row.isFullPage ?? 0,
      fixedTab: row.fixedTab ?? 0,
      activePath: row.activePath || '',
      showBadge: row.showBadge ?? 0,
      showTextBadge: row.showTextBadge || '',
      permission: row.permission || '',
      status: row.status ?? 1,
      remark: row.remark || ''
    })
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value || submitting.value) return

    try {
      await formRef.value.validate()
      submitting.value = true

      if (isEdit.value) {
        await updateMenu(form)
      } else {
        await addMenu(form)
      }

      emit('success')
      handleCancel()
    } catch {
      // 表单校验失败或接口报错
    } finally {
      submitting.value = false
    }
  }

  /**
   * 取消操作
   */
  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  /**
   * 对话框关闭后的回调
   */
  const handleClosed = (): void => {
    resetForm()
    isEdit.value = false
  }

  /**
   * 监听对话框显示状态
   */
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal && props.editData) {
        nextTick(() => loadFormData())
      }
    }
  )
</script>
