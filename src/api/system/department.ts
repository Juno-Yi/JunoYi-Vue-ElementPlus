import request from '@/utils/http'

/**
 * 获取部门树形列表
 */
export function fetchGetDeptTree(params?: Api.System.DeptQueryDTO) {
  return request.get<Api.System.DeptVO[]>({
    url: '/system/dept/tree',
    params
  })
}

/**
 * 获取部门详情
 */
export function fetchGetDeptById(id: number | string) {
  return request.get<Api.System.DeptVO>({
    url: `/system/dept/${id}`
  })
}

/**
 * 添加部门
 */
export function fetchAddDept(data: Api.System.DeptDTO) {
  return request.post<number>({
    url: '/system/dept',
    data,
    showSuccessMessage: true
  })
}

/**
 * 更新部门
 */
export function fetchUpdateDept(data: Api.System.DeptDTO) {
  return request.put<void>({
    url: '/system/dept',
    data,
    showSuccessMessage: true
  })
}

/**
 * 删除部门
 */
export function fetchDeleteDept(id: number | string) {
  return request.del<void>({
    url: `/system/dept/${id}`,
    showSuccessMessage: true
  })
}
