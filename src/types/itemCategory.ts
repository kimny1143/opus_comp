import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getMessage } from './validation/messages';

/**
 * 品目カテゴリーのEnum定義
 */
export enum ItemCategory {
  FOOD = 'FOOD',             // 飲食料品
  NEWSPAPER = 'NEWSPAPER',   // 定期購読の新聞
  AGRICULTURE = 'AGRICULTURE', // 農産品
  FISHERY = 'FISHERY',       // 水産品
  LIVESTOCK = 'LIVESTOCK',   // 畜産品
  ELECTRONICS = 'ELECTRONICS', // 電化製品
  CLOTHING = 'CLOTHING',     // 衣類
  FURNITURE = 'FURNITURE',   // 家具
  SERVICES = 'SERVICES',     // サービス
  OTHER = 'OTHER'           // その他
}

/**
 * 品目カテゴリーのスキーマ
 */
export const itemCategorySchema = z.nativeEnum(ItemCategory, {
  errorMap: () => ({ message: getMessage('invalidItemCategory') })
});

/**
 * 品目カテゴリーの表示名
 */
export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  [ItemCategory.FOOD]: '飲食料品',
  [ItemCategory.NEWSPAPER]: '定期購読の新聞',
  [ItemCategory.AGRICULTURE]: '農産品',
  [ItemCategory.FISHERY]: '水産品',
  [ItemCategory.LIVESTOCK]: '畜産品',
  [ItemCategory.ELECTRONICS]: '電化製品',
  [ItemCategory.CLOTHING]: '衣類',
  [ItemCategory.FURNITURE]: '家具',
  [ItemCategory.SERVICES]: 'サービス',
  [ItemCategory.OTHER]: 'その他'
};

/**
 * 品目カテゴリーの説明
 */
export const ITEM_CATEGORY_DESCRIPTIONS: Record<ItemCategory, string> = {
  [ItemCategory.FOOD]: '飲食料品全般',
  [ItemCategory.NEWSPAPER]: '定期購読の新聞',
  [ItemCategory.AGRICULTURE]: '農産物全般',
  [ItemCategory.FISHERY]: '水産物全般',
  [ItemCategory.LIVESTOCK]: '畜産物全般',
  [ItemCategory.ELECTRONICS]: '電化製品全般',
  [ItemCategory.CLOTHING]: '衣類全般',
  [ItemCategory.FURNITURE]: '家具全般',
  [ItemCategory.SERVICES]: 'サービス全般',
  [ItemCategory.OTHER]: 'その他の品目'
};

/**
 * 品目カテゴリーの選択オプションを生成
 */
export const getItemCategoryOptions = () =>
  Object.entries(ItemCategory).map(([key, value]) => ({
    value,
    label: ITEM_CATEGORY_LABELS[value],
    description: ITEM_CATEGORY_DESCRIPTIONS[value]
  }));

/**
 * 軽減税率対象カテゴリーの判定
 */
export const isReducedTaxCategory = async (category: ItemCategory): Promise<boolean> => {
  const categoryMaster = await prisma.itemCategoryMaster.findUnique({
    where: { category }
  });
  return categoryMaster?.isReducedTaxRate ?? false;
};

/**
 * 品目カテゴリーの詳細情報を取得
 */
export const getItemCategoryDetails = async (category: ItemCategory) => {
  const categoryMaster = await prisma.itemCategoryMaster.findUnique({
    where: { category }
  });

  if (!categoryMaster) {
    throw new Error(`Category not found: ${category}`);
  }

  return {
    ...categoryMaster,
    label: ITEM_CATEGORY_LABELS[category],
    description: ITEM_CATEGORY_DESCRIPTIONS[category]
  };
};

/**
 * 品目カテゴリーのグループ化
 */
export const REDUCED_TAX_CATEGORIES = [
  ItemCategory.FOOD,
  ItemCategory.NEWSPAPER,
  ItemCategory.AGRICULTURE,
  ItemCategory.FISHERY,
  ItemCategory.LIVESTOCK
] as const;

export const STANDARD_TAX_CATEGORIES = [
  ItemCategory.ELECTRONICS,
  ItemCategory.CLOTHING,
  ItemCategory.FURNITURE,
  ItemCategory.SERVICES,
  ItemCategory.OTHER
] as const;

export const ITEM_CATEGORY_GROUPS = {
  REDUCED_TAX: REDUCED_TAX_CATEGORIES,
  STANDARD_TAX: STANDARD_TAX_CATEGORIES
} as const;

/**
 * カテゴリーグループの判定
 */
type CategoryGroup = keyof typeof ITEM_CATEGORY_GROUPS;

export const getCategoryGroup = (category: ItemCategory): CategoryGroup => {
  return REDUCED_TAX_CATEGORIES.includes(category as typeof REDUCED_TAX_CATEGORIES[number])
    ? 'REDUCED_TAX'
    : 'STANDARD_TAX';
};

/**
 * カテゴリーグループの表示名
 */
export const CATEGORY_GROUP_LABELS = {
  REDUCED_TAX: '軽減税率対象',
  STANDARD_TAX: '標準税率対象'
} as const;

/**
 * グループ別のカテゴリー選択オプションを生成
 */
export const getGroupedItemCategoryOptions = () => {
  const options = getItemCategoryOptions();
  return (Object.entries(ITEM_CATEGORY_GROUPS) as [CategoryGroup, readonly ItemCategory[]][]).map(([group, categories]) => ({
    label: CATEGORY_GROUP_LABELS[group],
    options: options.filter(option =>
      group === 'REDUCED_TAX'
        ? REDUCED_TAX_CATEGORIES.includes(option.value as typeof REDUCED_TAX_CATEGORIES[number])
        : STANDARD_TAX_CATEGORIES.includes(option.value as typeof STANDARD_TAX_CATEGORIES[number])
    )
  }));
};