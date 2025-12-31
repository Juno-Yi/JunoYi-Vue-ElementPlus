/**
 * 图标选择器预设图标配置
 * 图标来源：https://icones.js.org/
 *
 * @author Fan
 */



import remixIconData from "@/components/core/forms/art-icon-picker/icon/remixIcon";
import materialIconThemeData from "@/components/core/forms/art-icon-picker/icon/materialIconTheme";
import fluentColorData from "@/components/core/forms/art-icon-picker/icon/FluentColor";

/** 图标分类 */
export const iconCategories = [
  { key: 'RemixIcon', label: 'RemixIcon' },
  { key: 'MaterialIconTheme', label: 'MaterialIconTheme'},
  { key: 'FluentColor', label: 'FluentColor'},

] as const

export type IconCategoryKey = (typeof iconCategories)[number]['key']

/** 预设图标列表 */
export const presetIcons: Record<IconCategoryKey, string[]> = {
  RemixIcon: remixIconData,
  MaterialIconTheme: materialIconThemeData,
  FluentColor: fluentColorData
}
