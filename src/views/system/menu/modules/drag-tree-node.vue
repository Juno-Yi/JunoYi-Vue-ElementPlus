<!-- 拖拽树节点组件 -->
<template>
  <div
    ref="nodeRef"
    class="drag-tree-node"
    :class="{
      'is-directory': node.menuType === 0,
      'drag-over-before': isCurrentDropTarget && dropPosition === 'before',
      'drag-over-after': isCurrentDropTarget && dropPosition === 'after',
      'drag-over-inside': isCurrentDropTarget && dropPosition === 'inside',
      'is-dragging': isDragging
    }"
    :style="{ paddingLeft: `${level * 24 + 16}px` }"
    :data-node-id="node.id"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover.prevent="handleDragOver"
    @drop.prevent="handleDrop"
  >
    <div class="node-content">
      <span class="drag-handle">
        <ArtSvgIcon icon="ri:drag-move-2-fill" />
      </span>
      
      <span 
        v-if="node.children?.length" 
        class="expand-icon"
        @click.stop="toggleExpand"
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
      :currentDropNodeId="currentDropNodeId"
      @drop="(dragId: number, targetId: number, position: 'before' | 'after' | 'inside') => emit('drop', dragId, targetId, position)"
      @update:currentDropNodeId="(id: number | null) => emit('update:currentDropNodeId', id)"
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
    currentDropNodeId?: number | null
  }

  interface Emits {
    (e: 'drop', dragId: number, targetId: number, position: 'before' | 'after' | 'inside'): void
    (e: 'update:currentDropNodeId', id: number | null): void
  }

  const props = withDefaults(defineProps<Props>(), {
    currentDropNodeId: null
  })
  const emit = defineEmits<Emits>()

  const nodeRef = ref<HTMLElement>()
  const isExpanded = ref(true)
  const isDragging = ref(false)
  const dropPosition = ref<'before' | 'after' | 'inside' | null>(null)

  // 是否是当前拖放目标
  const isCurrentDropTarget = computed(() => props.currentDropNodeId === props.node.id)

  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
  }

  const handleDragStart = (e: DragEvent): void => {
    e.stopPropagation()
    isDragging.value = true
    e.dataTransfer!.effectAllowed = 'move'
    e.dataTransfer!.setData('text/plain', String(props.node.id))
  }

  const handleDragEnd = (): void => {
    isDragging.value = false
    dropPosition.value = null
    emit('update:currentDropNodeId', null)
  }

  const handleDragOver = (e: DragEvent): void => {
    e.stopPropagation()
    
    const dragId = e.dataTransfer?.types.includes('text/plain') 
      ? e.dataTransfer.getData('text/plain') 
      : null
    
    // 不能拖到自己身上
    if (dragId === String(props.node.id)) {
      dropPosition.value = null
      return
    }

    // 更新当前拖放目标
    emit('update:currentDropNodeId', props.node.id)

    const rect = nodeRef.value!.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    // 根据鼠标位置判断放置位置
    if (y < height * 0.25) {
      dropPosition.value = 'before'
    } else if (y > height * 0.75) {
      dropPosition.value = 'after'
    } else if (props.node.menuType === 0) {
      dropPosition.value = 'inside'
    } else {
      dropPosition.value = 'after'
    }

    e.dataTransfer!.dropEffect = 'move'
  }

  const handleDrop = (e: DragEvent): void => {
    e.stopPropagation()
    
    const dragId = e.dataTransfer?.getData('text/plain')
    
    if (dragId && dropPosition.value && dragId !== String(props.node.id)) {
      emit('drop', Number(dragId), props.node.id, dropPosition.value)
    }
    
    dropPosition.value = null
    emit('update:currentDropNodeId', null)
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
    user-select: none;
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
    height: 3px;
    background-color: var(--el-color-primary);
    pointer-events: none;
    z-index: 10;
  }

  .drag-tree-node.drag-over-after::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: var(--el-color-primary);
    pointer-events: none;
    z-index: 10;
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
</style>
