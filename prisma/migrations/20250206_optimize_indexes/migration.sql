-- インデックスの追加
CREATE INDEX "invoice_items_invoice_id_idx" ON "InvoiceItem"("invoiceId");
CREATE INDEX "invoice_template_items_template_id_idx" ON "InvoiceTemplateItem"("templateId");
CREATE INDEX "project_member_project_id_idx" ON "ProjectMember"("projectId");
CREATE INDEX "project_member_user_id_idx" ON "ProjectMember"("userId");

-- 複合インデックスの追加
CREATE INDEX "invoice_status_due_date_idx" ON "Invoice"("status", "dueDate");
CREATE INDEX "purchase_order_status_order_date_idx" ON "PurchaseOrder"("status", "orderDate");
CREATE INDEX "status_history_type_status_idx" ON "StatusHistory"("type", "status");

-- コメント
COMMENT ON INDEX "invoice_items_invoice_id_idx" IS 'インボイス明細の高速検索用';
COMMENT ON INDEX "invoice_template_items_template_id_idx" IS 'テンプレート明細の高速検索用';
COMMENT ON INDEX "project_member_project_id_idx" IS 'プロジェクトメンバーの検索最適化用';
COMMENT ON INDEX "project_member_user_id_idx" IS 'ユーザーごとのプロジェクト検索用';
COMMENT ON INDEX "invoice_status_due_date_idx" IS '支払期限管理の最適化用';
COMMENT ON INDEX "purchase_order_status_order_date_idx" IS '発注管理の最適化用';
COMMENT ON INDEX "status_history_type_status_idx" IS 'ステータス履歴検索の最適化用';