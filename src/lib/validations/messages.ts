export const validationMessages = {
  required: {
    vendor: '取引先の選択は必須です',
    itemName: '品目名は必須です',
    quantity: '数量は必須です',
  },
  format: {
    email: '有効なメールアドレスを入力してください',
    phone: '電話番号は数字とハイフンのみ使用できます',
    registrationNumber: 'インボイス登録番号の形式が正しくありません',
    myNumber: 'マイナンバーの形式が正しくありません',
  },
  date: {
    dueDate: '支払期限は発行日以降である必要があります',
    deliveryDate: '納期は発注日以降である必要があります',
  },
  number: {
    quantity: '数量は1以上である必要があります',
    unitPrice: '単価は0以上である必要があります',
    taxRate: '税率は0-100%の範囲で指定してください',
  },
  auth: {
    required: '認証が必要です',
  },
  vendor: {
    notFound: '取引先が見つかりません',
    hasRelatedData: '関連する発注書または請求書が存在するため削除できません',
    deleted: '取引先を削除しました',
  },
  validation: {
    invalid: 'バリデーションエラーが発生しました',
  },
  error: {
    deletion: '削除中にエラーが発生しました',
    system: 'システムエラーが発生しました',
    update: '更新中にエラーが発生しました',
    methodNotAllowed: '許可されていないメソッドです',
    server: 'サーバーエラーが発生しました'
  },
  invoice: {
    notFound: '請求書が見つかりません',
    hasRelatedData: '関連するデータが存在するため削除できません',
    invalidStatus: '無効なステータスです',
    deleted: '請求書を削除しました',
  },
  purchaseOrder: {
    notFound: '発注書が見つかりません',
    hasRelatedData: '関連するデータが存在するため削除できません',
    invalidStatus: '無効なステータスです',
    deleted: '発注書を削除しました',
    statusUpdated: 'ステータスを更新しました',
    bulkDeleted: '選択した発注書を削除しました',
    bulkStatusUpdated: '選択した発注書のステータスを更新しました',
    statusTransition: {
      draft: {
        sent: '発注書を送信しました',
        rejected: 'ステータスをDRAFTからREJECTEDに直接変更することはできません',
        completed: 'ステータスをDRAFTからCOMPLETEDに直接変更することはできません'
      },
      sent: {
        accepted: '発注書が承認されました',
        rejected: '発注書が却下されました',
        completed: 'ステータスをSENTからCOMPLETEDに直接変更することはできません'
      },
      accepted: {
        completed: '発注書を完了しました',
        rejected: 'ステータスをACCEPTEDからREJECTEDに変更することはできません'
      },
      rejected: {
        draft: '発注書を下書きに戻しました',
        completed: 'ステータスをREJECTEDからCOMPLETEDに変更することはできません'
      },
      completed: {
        message: '完了済みの発注書のステータスは変更できません'
      }
    }
  },
} as const; 