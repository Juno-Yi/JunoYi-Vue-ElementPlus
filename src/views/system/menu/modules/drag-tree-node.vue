<!-- 拖拽树节点组件 -->
<template>
  <div
    class="drag-tree-node"
    :class="{
      'is-directory': node.menuType === 0,
      'drag-over-before': dropPosition === 'before',
      'drag-over-after': dropPosition === 'after',
      'drag-over-inside': dropPosition === 'inside',
      'is-dragging': isDragging
    }"
    :style="{ paddingLeft: `${level * 24 + 16}px` }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="node-content">
      <span class="drag-handle">
        <ArtSvgIcon icon="ri:drag-move-2-fill" />
      </span>
      
      <span 
        v-if="node.children?.length" 
        class="expand-icon"
        @click="toggleExpand"
      >
        <ArtSvgIcon :icon="isExpanded ? 'ri:arrow-down-s-line' : 'ri:arrow-right-s-line'" />
      </span>
      <span v-else class="expand-placeholder"></span>
      
      <ArtSvgIcon v-if="node.icon" :icon="node.icon" class="node-icon" />
      
      <span class="node-title">{{ formatMenuTitle(node.title) }}</span>
    </div>
    
    <div class="node-type">
      <ElTag :type="node.menuType === 0 ? 'info' : 'primary'" size="small">
        {{ node.menuType === 0 ? '目录' : '菜单' }}
      </ElTag>
    </div>
    
    <div class="node-sort">{{ node.sort }}</div>
    
    <div class="node-path">{{ node.path || '-' }}</div>
  </div>
  
  <!-- 子节点 -->
  <template v-if="isExpanded && node.children?.length">
    <DragTreeNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :level="level + 1"
      @drop="(dragId, targetId, position) => emit('drop', dragId, targetId, position)"
    />
  </template>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { ElTag } from 'element-plus'

  interface Props {
    node: Api.System.MenuVO
    level: number
  }

  interface Emits {
    (e: 'drop', dragId: number, targetId: number, position: 'before' | 'after' | 'inside'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const isExpanded = ref(true)
  const isDragging = ref(false)
  const dropPosition = ref<'before' | 'after' | 'inside' | null>(null)

  // 当前拖拽的节点ID（全局共享）
  let currentDragId: number | null = null

  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
  }

  const handleDragStart = (e: DragEvent): void => {
    isDragging.value = true
    currentDragId = props.node.id
    e.dataTransfer!.effectAllowed = 'move'
    e.dataTransfer!.setData('text/plain', String(props.node.id))
    
    // 添加拖拽样式
    const target = e.target as HTMLElement
    setTimeout(() => {
      target.classList.add('dragging')
    }, 0)
  }

  const handleDragEnd = (e: DragEvent): void => {
    isDragging.value = false
    currentDragId = null
    const target = e.target as HTMLElement
    target.classList.remove('dragging')
  }

  const handleDragOver = (e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    
    // 不能拖到自己身上
    if (currentDragId === props.node.id) {
      dropPosition.value = null
      return
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    // 根据鼠标位置判断放置位置
    if (y < height * 0.25) {
      dropPosition.value = 'before'
    } else if (y > height * 0.75) {
      dropPosition.value = 'after'
    } else if (props.node.menuType === 0) {
      // 只有目录才能放入内部
      dropPosition.value = 'inside'
    } else {
      dropPosition.value = 'after'
    }

    e.dataTransfer!.dropEffect = 'move'
  }

  const handleDragLeave = (e: DragEvent): void => {
    // 检查是否真的离开了元素
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      dropPosition.value = null
    }
  }

  const handleDrop = (e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    
    const dragId = parseInt(e.dataTransfer!.getData('text/plain'))
    
    if (dragId && dropPosition.value && dragId !== props.node.id) {
      emit('drop', dragId, props.node.id, dropPosition.value)
    }
    
    dropPosition.value = null
  }
</script>

<style scoped>
  .drag-tree-node {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: move;
    transition: background-color 0.2s;
    position: relative;
  }

  .drag-tree-node:hover {
    background-color: var(--el-fill-color-light);
  }

  .drag-tree-node.is-directory {
    background-color: var(--el-fill-color-lighter);
  }

  .drag-tree-node.is-dragging {
    opacity: 0.5;
  }

  .drag-tree-node.drag-over-before::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--el-color-primary);
  }

  .drag-tree-node.drag-over-after::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--el-color-primary);
  }

  .drag-tree-node.drag-over-inside {
    background-color: var(--el-color-primary-light-9);
    outline: 2px dashed var(--el-color-primary);
    outline-offset: -2px;
  }

  .node-content {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .drag-handle {
    color: var(--el-text-color-placeholder);
    cursor: move;
  }

  .drag-handle:hover {
    color: var(--el-color-primary);
  }

  .expand-icon {
    cursor: pointer;
    color: var(--el-text-color-secondary);
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .expand-icon:hover {
    color: var(--el-color-primary);
  }

  .expand-placeholder {
    width: 16px;
  }

  .node-icon {
    font-size: 16px;
    color: var(--el-text-color-secondary);
  }

  .node-title {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .node-type {
    width: 80px;
    text-align: center;
  }

  .node-sort {
    width: 60px;
    text-align: center;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .node-path {
    width: 200px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.dragging) {
    opacity: 0.4;
  }
</style>
