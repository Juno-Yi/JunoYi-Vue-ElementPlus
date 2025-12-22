/**
 * 国际化配置
 *
 * @author Fan
 */
import {createI18n, type I18n, type I18nOptions} from "vue-i18n";



// const storageKeyManager = new StorageKeyManager()

/**
 * i18n 配置选项
 */
const i18nOptions: I18nOptions = {
    legacy: false
}

/**
 * i18n 实例
 */
const i18n: I18n = createI18n(i18nOptions);

/**
 * 翻译函数类型
 */
interface Translation {
    (key: string): string
}

/**
 * 全局翻译函数
 * 可在任何地方使用，无需导入 useI18n
 */
export const $text = i18n.global.t as Translation;

export default i18n;