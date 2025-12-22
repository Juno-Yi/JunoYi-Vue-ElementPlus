/**
 * Pinia Store 状态实例创建
 *
 * @author Fan
 */
import type {App} from "vue";
import {createPinia} from "pinia";

/**
 * 创建Pinia实例
 */
export const store = createPinia();


/**
 * 初始化Pinia状态管理
 * @param app Vue实例
 */
export function initPiniaStore(app: App<Element>) {
    app.use(store);
}