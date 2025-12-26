import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/auth/login',
    params
  })
}

/**
 * 获取验证码
 * @returns 验证码响应
 */
export function getCaptcha() {
  return request.get<Api.Auth.CaptchaResponse>({
    url: '/captcha/image'
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/user/info'
  })
}
