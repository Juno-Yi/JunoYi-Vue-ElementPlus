<!-- 角色分配权限组弹窗 -->
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
        <VueDraggable
          v-model="availableGroups"
          class="flex-1 overflow-auto p-2 drag-area"
          group="rolePermGroups"
          :animation="150"
          ghost-class="ghost"
          chosen-class="chosen"
          drag-class="dragging"
          item-key="id"
        >
          <template #item="{ element }">
            <div class="perm-item">
              <ArtSvgIcon icon="ri:folder-shield-line" class="mr-2 text-gray-500" />
              <span class="flex-1 truncate">{{ element.groupName }}</span>
              <ElTag v-if="isSuperGroup(element)" type="warning" size="small" effect="light">超级</ElTag>
              <span v-else class="text-xs text-gray-400">{{ element.groupCode }}</span>
            </div>
          </template>
        </VueDraggable>
        <div v-if="availableGroups.length === 0" class="text-center text-gray-400 py-8">
          暂无可分配权限组
        </div>
      </div>

      <!-- 右侧：已绑定权限组列表 -->
      <div class="flex-1 flex flex-col border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-600" :style="{ backgroundColor: primaryColorLight }">
          <span class="font-medium text-sm" :style="{ color: primaryColor }">已绑定权限组</span>
          <span class="text-xs ml-2" :style="{ color: primaryColor, opacity: 0.7 }">({{ boundGroups.length }})</span>
        </div>
        <VueDraggable
          v-model="boundGroups"
          class="flex-1 overflow-auto p-2 drag-area"
          group="rolePermGroups"
          :animation="150"
          ghost-class="ghost"
          chosen-class="chosen"
          drag-class="dragging"
          item-key="id"
        >
          <templa