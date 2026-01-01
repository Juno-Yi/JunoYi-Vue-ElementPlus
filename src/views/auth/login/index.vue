<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            :key="formKey"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <ElFormItem prop="username">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.username')"
                v-model.trim="formData.username"
              />
            </ElFormItem>
            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.password')"
                v-model.trim="formData.password"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <!-- 验证码 -->
            <ElFormItem prop="code">
              <div class="flex w-full gap-3">
                <ElInput
                  class="custom-height flex-1"
                  :placeholder="$t('login.placeholder.captcha')"
                  v-model.trim="formData.code"
                />
                <div
                  class="captcha-img cursor-pointer rounded-lg overflow-hidden flex-shrink-0"
                  @click="getCaptchaImage"
                  :title="$t('login.refreshCaptcha')"
                >
                  <img
                    v-if="captchaImage"
                    :src="'data:image/png;base64,' + captchaImage"
                    alt="captcha"
                    class="h-10 w-28 object-cover"
                  />
                  <div
                    v-else
                    class="h-10 w-28 bg-gray-100 flex items-center justify-center text-gray-400 text-sm"
                  >
                    {{ captchaLoading ? '加载中...' : '点击获取' }}
                  </div>
                </div>
              </div>
            </ElFormItem>

            <div class="flex-cb mt-2 text-sm">
              <ElCheckbox v-model="formData.rememberPassword">{{
                $t('login.rememberPwd')
              }}</ElCheckbox>
              <RouterLink class="text-theme" :to="{ name: 'ForgetPassword' }">{{
                $t('login.forgetPwd')
              }}</RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-gray-600">
              <span>{{ $t('login.noAccount') }}</span>
              <RouterLink class="text-theme" :to="{ name: 'Register' }">{{
                $t('login.register')
              }}</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>

      <!-- 版权信息 -->
      <div v-if="systemInfo" class="login-footer">
        <p class="copyright">
          Copyright © {{ systemInfo.copyrightYear }} {{ systemInfo.copyright }}
        </p>
        <p v-if="systemInfo.registration" class="registration">
          {{ systemInfo.registration }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { nextTick } from 'vue'
  import AppConfig from '@/config'
  import { useUserStore } from '@/store/modules/user'
  import { useI18n } from 'vue-i18n'
  import { HttpError } from '@/utils/http/error'
  import { fetchLogin, fetchGetCaptcha } from '@/api/auth'
  import { fetchGetSystemInfo, type SystemInfo } from '@/api/system/info'
  import { ElNotification, type FormInstance, type FormRules } from 'element-plus'

  defineOptions({ name: 'Login' })

  const { t, locale } = useI18n()
  const formKey = ref(0)

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()

  const systemName = AppConfig.systemInfo.name
  const formRef = ref<FormInstance>()

  // 验证码相关
  const captchaImage = ref('')
  const captchaLoading = ref(false)

  // 系统信息
  const systemInfo = ref<SystemInfo | null>(null)

  // 是否自动填充登录信息
  const autoFillLogin = import.meta.env.VITE_AUTO_FILL_LOGIN === 'true'

  const formData = reactive({
    captchaId: '',
    username: autoFillLogin ? 'super_admin' : '',
    password: autoFillLogin ? 'admin123' : '',
    code: '',
    rememberPassword: true
  })

  const rules = computed<FormRules>(() => ({
    username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }],
    code: [{ required: true, message: t('login.placeholder.captcha'), trigger: 'blur' }]
  }))

  const loading = ref(false)

  onMounted(() => {
    getCaptchaImage()
    getSystemInfo()
  })

  // 获取系统信息
  const getSystemInfo = async () => {
    try {
      systemInfo.value = await fetchGetSystemInfo()
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  }

  // 获取验证码
  const getCaptchaImage = async () => {
    try {
      captchaLoading.value = true
      const res = await fetchGetCaptcha()
      formData.captchaId = res.captchaId
      captchaImage.value = res.image
    } catch (error) {
      console.error('获取验证码失败:', error)
    } finally {
      captchaLoading.value = false
    }
  }

  // 登录
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      // 表单验证
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      // 登录请求
      const { username, password, code, captchaId } = formData

      const { accessToken, refreshToken } = await fetchLogin({
        captchaId,
        username,
        password,
        code
      })

      // 验证token
      if (!accessToken) {
        throw new Error('Login failed - no token received')
      }

      // 存储 token 和登录状态
      userStore.setToken(accessToken, refreshToken)
      userStore.setLoginStatus(true)

      // 等待 Vue 响应式系统更新完成
      await nextTick()

      // 登录成功处理
      showLoginSuccessNotice()

      // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (error) {
      // 刷新验证码
      getCaptchaImage()
      formData.code = ''

      if (error instanceof HttpError) {
        console.log(error.code)
      } else {
        console.error('[Login] Unexpected error:', error)
      }
    } finally {
      loading.value = false
    }
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}, ${systemName}!`
      })
    }, 1000)
  }
</script>

<style scoped>
  @import './style.css';
</style>

<style lang="scss" scoped>
  .captcha-img {
    border: 1px solid var(--art-border-color);
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }

  .login-footer {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .copyright {
      margin-bottom: 4px;
    }

    .registration {
      color: var(--el-text-color-placeholder);
    }
  }
</style>
