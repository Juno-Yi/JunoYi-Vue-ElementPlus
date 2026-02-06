<!-- 水印组件 -->
<template>
  <div
    v-if="finalWatermarkVisible"
    class="fixed left-0 top-0 h-screen w-screen pointer-events-none"
    :style="{ zIndex: zIndex }"
  >
    <ElWatermark
      :content="finalContent"
      :font="{ fontSize: fontSize, color: fontColor }"
      :rotate="rotate"
      :gap="[gapX, gapY]"
      :offset="[offsetX, offsetY]"
    >
      <div style="height: 100vh"></div>
    </ElWatermark>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { useSettingStore } from '@/store/modules/setting'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'ArtWatermark' })

  const settingStore = useSettingStore()
  const userStore = useUserStore()
  const { watermarkVisible, systemInfo } = storeToRefs(settingStore)

  // 优先使用接口返回的系统名称，如果没有则使用配置文件的
  const defaultContent = computed(() => systemInfo.value?.name || AppConfig.systemInfo.name)

  interface WatermarkProps {
    /** 水印内容 */
    content?: string
    /** 水印是否可见 */
    visible?: boolean
    /** 水印字体大小 */
    fontSize?: number
    /** 水印字体颜色 */
    fontColor?: string
    /** 水印旋转角度 */
    rotate?: number
    /** 水印间距X */
    gapX?: number
    /** 水印间距Y */
    gapY?: number
    /** 水印偏移X */
    offsetX?: number
    /** 水印偏移Y */
    offsetY?: number
    /** 水印层级 */
    zIndex?: number
  }

  const props = withDefaults(defineProps<WatermarkProps>(), {
    visible: false,
    fontSize: 16,
    fontColor: 'rgba(128, 128, 128, 0.2)',
    rotate: -22,
    gapX: 100,
    gapY: 100,
    offsetX: 50,
    offsetY: 50,
    zIndex: 3100
  })

  /**
   * 最终的水印可见性
   * 直接由系统配置控制，不需要用户手动开关
   */
  const finalWatermarkVisible = computed(() => {
    // 直接使用系统配置控制水印显示
    return settingStore.isSystemAppConfigEnabled('sys.watermark.enabled')
  })

  /**
   * 最终的水印内容
   * 优先级：props.content > 系统配置 > 默认内容
   * 支持变量替换：{username}, {date}, {time}
   */
  const finalContent = computed(() => {
    let text = props.content || settingStore.getSystemAppConfig('sys.watermark.text') || defaultContent.value

    // 变量替换
    if (text.includes('{username}')) {
      text = text.replace(/{username}/g, userStore.username || '用户')
    }
    if (text.includes('{date}')) {
      const date = new Date()
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      text = text.replace(/{date}/g, dateStr)
    }
    if (text.includes('{time}')) {
      const date = new Date()
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      text = text.replace(/{time}/g, timeStr)
    }

    return text
  })
</script>
