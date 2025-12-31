<!-- 图标选择器组件 -->
<template>
  <div class="art-icon-picker">
    <ElInput
      v-model="inputValue"
      :placeholder="placeholder"
      :clearable="clearable"
      :disabled="disabled"
      @input="handleInput"
      @clear="handleClear"
    >
      <template #prefix>
        <ArtSvgIcon v-if="modelValue" :icon="modelValue" class="text-base" />
        <ArtSvgIcon v-else icon="ri:image-line" class="text-base text-gray-400" />
      </template>
      <template #suffix>
        <ElButton
          :disabled="disabled"
          link
          @click="showPopover = true"
        >
          <ArtSvgIcon icon="ri:apps-line" class="text-base" />
        </ElButton>
      </template>
    </ElInput>

    <!-- 图标选择弹窗 -->
    <ElDialog
      v-model="showPopover"
      title="选择图标"
      width="680px"
      :close-on-click-modal="true"
      append-to-body
    >
      <!-- 搜索框 -->
      <ElInput
        v-model="searchKeyword"
        placeholder="搜索图标..."
        clearable
        class="mb-4"
      >
        <template #prefix>
          <ArtSvgIcon icon="ri:search-line" />
        </template>
      </ElInput>

      <!-- 图标分类 Tabs -->
      <ElTabs v-model="activeTab" class="icon-tabs">
        <ElTabPane
          v-for="category in iconCategories"
          :key="category.key"
          :label="category.label"
          :name="category.key"
        />
      </ElTabs>

      <!-- 图标列表 -->
      <div class="icon-grid">
        <div
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon-item"
          :class="{ 'is-selected': modelValue === icon }"
          :title="icon"
          @click="selectIcon(icon)"
        >
          <ArtSvgIcon :icon="icon" class="text-xl" />
        </div>
        <div v-if="filteredIcons.length === 0" class="no-icons">
          暂无匹配的图标
        </div>
      </div>

      <template #footer>
        <ElButton @click="showPopover = false">取消</ElButton>
        <ElButton type="primary" @click="confirmSelect">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { ElInput, ElButton, ElDialog, ElTabs, ElTabPane } from 'element-plus'

  defineOptions({ name: 'ArtIconPicker' })

  interface Props {
    modelValue?: string
    placeholder?: string
    clearable?: boolean
    disabled?: boolean
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '请输入或选择图标',
    clearable: true,
    disabled: false
  })

  const emit = defineEmits<Emits>()

  const inputValue = ref(props.modelValue)
  const showPopover = ref(false)
  const searchKeyword = ref('')
  const activeTab = ref('common')
  const tempSelected = ref('')

  // 预设图标分类
  const iconCategories = [
    { key: 'common', label: '常用' },
    { key: 'menu', label: '菜单' },
    { key: 'action', label: '操作' },
    { key: 'file', label: '文件' },
    { key: 'media', label: '媒体' },
    { key: 'device', label: '设备' },
    { key: 'other', label: '其他' }
  ]

  // 预设图标列表
  const presetIcons: Record<string, string[]> = {
    common: [
      'ri:home-line', 'ri:home-2-line', 'ri:home-3-line', 'ri:home-4-line',
      'ri:dashboard-line', 'ri:apps-line', 'ri:function-line', 'ri:settings-line',
      'ri:settings-2-line', 'ri:settings-3-line', 'ri:tools-line', 'ri:admin-line',
      'ri:user-line', 'ri:user-2-line', 'ri:user-3-line', 'ri:user-settings-line',
      'ri:team-line', 'ri:group-line', 'ri:contacts-line', 'ri:profile-line',
      'ri:shield-user-line', 'ri:shield-keyhole-line', 'ri:lock-line', 'ri:lock-2-line',
      'ri:key-line', 'ri:key-2-line', 'ri:safe-line', 'ri:safe-2-line',
      'ri:star-line', 'ri:star-s-line', 'ri:heart-line', 'ri:heart-2-line',
      'ri:bookmark-line', 'ri:bookmark-2-line', 'ri:flag-line', 'ri:flag-2-line'
    ],
    menu: [
      'ri:menu-line', 'ri:menu-2-line', 'ri:menu-3-line', 'ri:menu-4-line',
      'ri:menu-5-line', 'ri:menu-fold-line', 'ri:menu-unfold-line', 'ri:menu-add-line',
      'ri:list-check', 'ri:list-check-2', 'ri:list-ordered', 'ri:list-unordered',
      'ri:layout-line', 'ri:layout-2-line', 'ri:layout-3-line', 'ri:layout-4-line',
      'ri:layout-grid-line', 'ri:layout-masonry-line', 'ri:grid-line', 'ri:grid-fill',
      'ri:table-line', 'ri:table-2', 'ri:kanban-view', 'ri:gallery-view',
      'ri:pie-chart-line', 'ri:bar-chart-line', 'ri:line-chart-line', 'ri:donut-chart-line',
      'ri:bubble-chart-line', 'ri:radar-line', 'ri:stock-line', 'ri:funds-line'
    ],
    action: [
      'ri:add-line', 'ri:add-circle-line', 'ri:subtract-line', 'ri:close-line',
      'ri:close-circle-line', 'ri:check-line', 'ri:check-double-line', 'ri:checkbox-circle-line',
      'ri:edit-line', 'ri:edit-2-line', 'ri:edit-box-line', 'ri:pencil-line',
      'ri:delete-bin-line', 'ri:delete-bin-2-line', 'ri:delete-bin-5-line', 'ri:delete-bin-6-line',
      'ri:search-line', 'ri:search-2-line', 'ri:zoom-in-line', 'ri:zoom-out-line',
      'ri:filter-line', 'ri:filter-2-line', 'ri:filter-3-line', 'ri:sort-asc',
      'ri:refresh-line', 'ri:loop-left-line', 'ri:restart-line', 'ri:history-line',
      'ri:download-line', 'ri:download-2-line', 'ri:upload-line', 'ri:upload-2-line',
      'ri:share-line', 'ri:share-forward-line', 'ri:external-link-line', 'ri:links-line'
    ],
    file: [
      'ri:file-line', 'ri:file-2-line', 'ri:file-3-line', 'ri:file-4-line',
      'ri:file-text-line', 'ri:file-list-line', 'ri:file-list-2-line', 'ri:file-list-3-line',
      'ri:file-copy-line', 'ri:file-copy-2-line', 'ri:file-add-line', 'ri:file-reduce-line',
      'ri:file-edit-line', 'ri:file-search-line', 'ri:file-settings-line', 'ri:file-shield-line',
      'ri:file-excel-line', 'ri:file-excel-2-line', 'ri:file-word-line', 'ri:file-word-2-line',
      'ri:file-ppt-line', 'ri:file-ppt-2-line', 'ri:file-pdf-line', 'ri:file-pdf-2-line',
      'ri:file-zip-line', 'ri:file-code-line', 'ri:file-image-line', 'ri:file-music-line',
      'ri:folder-line', 'ri:folder-2-line', 'ri:folder-3-line', 'ri:folder-open-line',
      'ri:folder-add-line', 'ri:folder-reduce-line', 'ri:folder-settings-line', 'ri:folder-shield-line'
    ],
    media: [
      'ri:image-line', 'ri:image-2-line', 'ri:image-add-line', 'ri:image-edit-line',
      'ri:gallery-line', 'ri:gallery-upload-line', 'ri:picture-in-picture-line', 'ri:landscape-line',
      'ri:video-line', 'ri:video-add-line', 'ri:movie-line', 'ri:movie-2-line',
      'ri:film-line', 'ri:clapperboard-line', 'ri:camera-line', 'ri:camera-2-line',
      'ri:camera-3-line', 'ri:camera-lens-line', 'ri:webcam-line', 'ri:live-line',
      'ri:music-line', 'ri:music-2-line', 'ri:album-line', 'ri:disc-line',
      'ri:headphone-line', 'ri:speaker-line', 'ri:volume-up-line', 'ri:volume-down-line',
      'ri:mic-line', 'ri:mic-2-line', 'ri:voiceprint-line', 'ri:radio-line'
    ],
    device: [
      'ri:computer-line', 'ri:mac-line', 'ri:macbook-line', 'ri:laptop-line',
      'ri:smartphone-line', 'ri:tablet-line', 'ri:phone-line', 'ri:cellphone-line',
      'ri:tv-line', 'ri:tv-2-line', 'ri:monitor-line', 'ri:display-line',
      'ri:keyboard-line', 'ri:keyboard-box-line', 'ri:mouse-line', 'ri:gamepad-line',
      'ri:hard-drive-line', 'ri:hard-drive-2-line', 'ri:server-line', 'ri:database-line',
      'ri:database-2-line', 'ri:cloud-line', 'ri:cloud-off-line', 'ri:wifi-line',
      'ri:bluetooth-line', 'ri:usb-line', 'ri:cpu-line', 'ri:chip-line',
      'ri:printer-line', 'ri:scanner-line', 'ri:save-line', 'ri:sd-card-line'
    ],
    other: [
      'ri:notification-line', 'ri:notification-2-line', 'ri:notification-3-line', 'ri:notification-4-line',
      'ri:alarm-line', 'ri:alarm-warning-line', 'ri:error-warning-line', 'ri:information-line',
      'ri:question-line', 'ri:question-mark', 'ri:spam-line', 'ri:spam-2-line',
      'ri:mail-line', 'ri:mail-open-line', 'ri:mail-send-line', 'ri:mail-add-line',
      'ri:message-line', 'ri:message-2-line', 'ri:message-3-line', 'ri:chat-1-line',
      'ri:chat-2-line', 'ri:chat-3-line', 'ri:chat-4-line', 'ri:discuss-line',
      'ri:calendar-line', 'ri:calendar-2-line', 'ri:calendar-event-line', 'ri:calendar-todo-line',
      'ri:time-line', 'ri:timer-line', 'ri:timer-2-line', 'ri:hourglass-line',
      'ri:map-line', 'ri:map-2-line', 'ri:map-pin-line', 'ri:compass-line',
      'ri:global-line', 'ri:earth-line', 'ri:translate', 'ri:translate-2'
    ]
  }

  // 当前分类的图标
  const currentCategoryIcons = computed(() => {
    return presetIcons[activeTab.value] || []
  })

  // 过滤后的图标
  const filteredIcons = computed(() => {
    if (!searchKeyword.value) {
      return currentCategoryIcons.value
    }
    const keyword = searchKeyword.value.toLowerCase()
    return currentCategoryIcons.value.filter(icon => 
      icon.toLowerCase().includes(keyword)
    )
  })

  // 监听 props 变化
  watch(() => props.modelValue, (val) => {
    inputValue.value = val
  })

  // 打开弹窗时初始化
  watch(showPopover, (val) => {
    if (val) {
      tempSelected.value = props.modelValue
      searchKeyword.value = ''
    }
  })

  const handleInput = (val: string): void => {
    emit('update:modelValue', val)
    emit('change', val)
  }

  const handleClear = (): void => {
    emit('update:modelValue', '')
    emit('change', '')
  }

  const selectIcon = (icon: string): void => {
    tempSelected.value = icon
    inputValue.value = icon
    emit('update:modelValue', icon)
  }

  const confirmSelect = (): void => {
    emit('change', tempSelected.value)
    showPopover.value = false
  }
</script>

<style scoped>
  .art-icon-picker {
    width: 100%;
  }

  .icon-tabs {
    margin-bottom: 16px;
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
    max-height: 320px;
    overflow-y: auto;
    padding: 4px;
  }

  .icon-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--el-text-color-regular);
  }

  .icon-item:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  .icon-item.is-selected {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-8);
  }

  .no-icons {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 0;
    color: var(--el-text-color-placeholder);
  }
</style>
