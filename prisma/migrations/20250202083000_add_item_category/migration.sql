-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM (
  'FOOD',           -- 飲食料品
  'NEWSPAPER',      -- 定期購読の新聞
  'AGRICULTURE',    -- 農産品
  'FISHERY',        -- 水産品
  'LIVESTOCK',      -- 畜産品
  'ELECTRONICS',    -- 電化製品
  'CLOTHING',       -- 衣類
  'FURNITURE',      -- 家具
  'SERVICES',       -- サービス
  'OTHER'          -- その他
);

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN "category" "ItemCategory" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "PurchaseOrderItem" ADD COLUMN "category" "ItemCategory" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "InvoiceTemplateItem" ADD COLUMN "category" "ItemCategory" NOT NULL DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "ItemCategoryMaster" (
    "id" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isReducedTaxRate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemCategoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategoryMaster_category_key" ON "ItemCategoryMaster"("category");

-- Insert default categories
INSERT INTO "ItemCategoryMaster" ("id", "category", "name", "description", "isReducedTaxRate", "createdAt", "updatedAt")
VALUES
  ('cat_food', 'FOOD', '飲食料品', '飲食料品全般', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_news', 'NEWSPAPER', '定期購読の新聞', '定期購読の新聞', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_agri', 'AGRICULTURE', '農産品', '農産物全般', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_fish', 'FISHERY', '水産品', '水産物全般', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_live', 'LIVESTOCK', '畜産品', '畜産物全般', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_elec', 'ELECTRONICS', '電化製品', '電化製品全般', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_clot', 'CLOTHING', '衣類', '衣類全般', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_furn', 'FURNITURE', '家具', '家具全般', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_serv', 'SERVICES', 'サービス', 'サービス全般', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_other', 'OTHER', 'その他', 'その他の品目', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);