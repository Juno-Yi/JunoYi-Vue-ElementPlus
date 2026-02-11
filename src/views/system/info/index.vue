<template>
  <div class="system-info-page">
    <ElRow :gutter="16">
      <!-- 系统信息 -->
      <ElCol :span="12">
        <ElCard shadow="never" class="info-card">
          <template #header>
            <div class="card-header">
              <ArtSvgIcon icon="ri:information-line" class="mr-2" />
              <span>系统信息</span>
            </div>
          </template>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="系统名称">
              <ElTag type="primary">{{ systemInfo.name }}</ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="系统版本">
              <ElTag type="success">{{ systemInfo.version }}</ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="框架版本">
              {{ systemInfo.frameworkVersion }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="运行环境">
              {{ systemInfo.environment }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="启动时间">
              {{ systemInfo.startTime }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="运行时长">
              <ElTag type="info">{{ systemInfo.uptime }}</ElTag>
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>

      <!-- 服务器信息 -->
      <ElCol :span="12">
        <ElCard shadow="never" class="info-card">
          <template #header>
            <div class="card-header">
              <ArtSvgIcon icon="ri:server-line" class="mr-2" />
              <span>服务器信息</span>
            </div>
          </template>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="服务器名称">
              {{ serverInfo.name }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作系统">
              {{ serverInfo.os }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="系统架构">
              {{ serverInfo.arch }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="CPU 核心数">
              {{ serverInfo.cpuCores }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="服务器IP">
              {{ serverInfo.ip }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="服务器时间">
              {{ serverInfo.time }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16" class="mt-4">
      <!-- Java 信息 -->
      <ElCol :span="12">
        <ElCard shadow="never" class="info-card">
          <template #header>
            <div class="card-header">
              <ArtSvgIcon icon="ri:code-box-line" class="mr-2" />
              <span>Java 信息</span>
            </div>
          </template>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="Java 版本">
              {{ javaInfo.version }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="Java 供应商">
              {{ javaInfo.vendor }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="Java Home">
              <div class="text-ellipsis">{{ javaInfo.home }}</div>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="JVM 名称">
              {{ javaInfo.jvmName }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="JVM 版本">
              {{ javaInfo.jvmVersion }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="运行参数">
              <div class="text-ellipsis">{{ javaInfo.args }}</div>
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>

      <!-- 内存信息 -->
      <ElCol :span="12">
        <ElCard shadow="never" class="info-card">
          <template #header>
            <div class="card-header">
              <ArtSvgIcon icon="ri:database-2-line" class="mr-2" />
              <span>内存信息</span>
            </div>
          </template>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="总内存">
              {{ memoryInfo.total }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="已用内存">
              <ElTag :type="getMemoryType(memoryInfo.usedPercent)">
                {{ memoryInfo.used }} ({{ memoryInfo.usedPercent }}%)
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="空闲内存">
              {{ memoryInfo.free }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="JVM 总内存">
              {{ memoryInfo.jvmTotal }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="JVM 已用">
              <ElTag :type="getMemoryType(memoryInfo.jvmUsedPercent)">
                {{ memoryInfo.jvmUsed }} ({{ memoryInfo.jvmUsedPercent }}%)
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="JVM 空闲">
              {{ memoryInfo.jvmFree }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16" class="mt-4">
      <!-- 磁盘信息 -->
      <ElCol :span="24">
        <ElCard shadow="never" class="info-card">
          <template #header>
            <div class="card-header">
              <ArtSvgIcon icon="ri:hard-drive-2-line" class="mr-2" />
              <span>磁盘信息</span>
            </div>
          </template>
          <ElTable :data="diskInfo" border>
            <ElTableColumn prop="path" label="挂载点" width="150" />
            <ElTableColumn prop="type" label="文件系统" width="120" />
            <ElTableColumn prop="total" label="总容量" width="120" />
            <ElTableColumn prop="used" label="已用" width="120" />
            <ElTableColumn prop="free" label="可用" width="120" />
            <ElTableColumn prop="usedPercent" label="使用率" width="120">
              <template #default="{ row }">
                <ElProgress 
                  :percentage="row.usedPercent" 
                  :color="getProgressColor(row.usedPercent)"
                  :stroke-width="16"
                />
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import { ElCard, ElRow, ElCol, ElDescriptions, ElDescriptionsItem, ElTag, ElTable, ElTableColumn, ElProgress } from 'element-plus'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

defineOptions({ name: 'SystemInfo' })

// 系统信息
const systemInfo = ref({
  name: 'JunoYi 企业级开发框架',
  version: '1.0.0',
  frameworkVersion: 'Spring Boot 3.2.0',
  environment: 'Production',
  startTime: '2024-01-01 10:00:00',
  uptime: '15天 6小时 30分钟'
})

// 服务器信息
const serverInfo = ref({
  name: 'junoyi-server-01',
  os: 'Linux 5.15.0-91-generic',
  arch: 'x86_64',
  cpuCores: 8,
  ip: '192.168.1.100',
  time: new Date().toLocaleString()
})

// Java 信息
const javaInfo = ref({
  version: '17.0.9',
  vendor: 'Oracle Corporation',
  home: '/usr/lib/jvm/java-17-openjdk-amd64',
  jvmName: 'OpenJDK 64-Bit Server VM',
  jvmVersion: '17.0.9+9-Ubuntu-122.04',
  args: '-Xms512m -Xmx2048m -XX:+UseG1GC'
})

// 内存信息
const memoryInfo = ref({
  total: '16.0 GB',
  used: '8.5 GB',
  free: '7.5 GB',
  usedPercent: 53,
  jvmTotal: '2.0 GB',
  jvmUsed: '1.2 GB',
  jvmFree: '0.8 GB',
  jvmUsedPercent: 60
})

// 磁盘信息
const diskInfo = ref([
  {
    path: '/',
    type: 'ext4',
    total: '100 GB',
    used: '45 GB',
    free: '55 GB',
    usedPercent: 45
  },
  {
    path: '/data',
    type: 'ext4',
    total: '500 GB',
    used: '320 GB',
    free: '180 GB',
    usedPercent: 64
  }
])

/**
 * 获取内存使用率标签类型
 */
const getMemoryType = (percent: number) => {
  if (percent < 60) return 'success'
  if (percent < 80) return 'warning'
  return 'danger'
}

/**
 * 获取进度条颜色
 */
const getProgressColor = (percent: number) => {
  if (percent < 60) return '#67c23a'
  if (percent < 80) return '#e6a23c'
  return '#f56c6c'
}

// 定时更新服务器时间
onMounted(() => {
  const timer = setInterval(() => {
    serverInfo.value.time = new Date().toLocaleString()
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<style scoped lang="scss">
.system-info-page {
  padding: 16px;
}

.info-card {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    padding: 16px 20px;
    background-color: var(--el-fill-color-light);
  }
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  font-weight: 500;
}

:deep(.el-table) {
  font-size: 14px;
}
</style>
