import request from '@/utils/http';
import {AppRouteRecord} from "@/types";

/**
 * 获取菜单列表路由
 * （由后端来获取菜单数据，动态路由)
 */
export function fetchGetMenuList() {
    return request.get<AppRouteRecord[]>({
        url: '/router'
    })
}
