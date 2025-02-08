# 実装計画書: セッション管理・API改善計画 (2025/02/08)

## 1. 現状の問題点

### 1.1 セッション管理の非効率性

1. **セッションストレージの問題**

   - cleanup()メソッドがredis.keys()を使用し、大規模データセットで性能低下
   - 期限切れセッションの削除が非効率
   - セッション再生成時に既存セッションを全て削除

2. **認証システムの脆弱性**
   - loginAttemptsがメモリ上のMapで管理され、サーバー再起動で消失
   - ログインブロックが分散環境で整合性なし
   - セッショントークン管理の不備

### 1.2 APIエンドポイントの問題

1. **405エラーの発生**

   - メソッドチェックロジックの重複
   - 不完全なCORS設定
   - エラーレスポンス形式の非統一

2. **パフォーマンス問題**
   - N+1問題の可能性(特にstatusHistory)
   - 非効率なトランザクション処理

## 2. 改善計画

### 2.1 セッション管理の改善

```typescript
// セッションクリーンアップの改善案
async cleanup(): Promise<void> {
  const BATCH_SIZE = 100;
  const pattern = `${SESSION_PREFIX}*`;

  try {
    const redis = await getRedisClient();
    let cursor = '0';
    let cleanedCount = 0;

    do {
      // SCAN を使用して効率的にキーを取得
      const [newCursor, keys] = await redis.scan(
        cursor,
        'MATCH', pattern,
        'COUNT', BATCH_SIZE
      );
      cursor = newCursor;

      if (keys.length > 0) {
        // パイプラインを使用して一括処理
        const pipeline = redis.pipeline();
        keys.forEach(key => pipeline.get(key));
        const results = await pipeline.exec();

        const expiredKeys = [];
        results?.forEach((result, index) => {
          if (result[1]) {
            const session = JSON.parse(result[1] as string);
            if (new Date() > new Date(session.expiresAt)) {
              expiredKeys.push(keys[index]);
            }
          }
        });

        if (expiredKeys.length > 0) {
          await redis.del(...expiredKeys);
          cleanedCount += expiredKeys.length;
        }
      }
    } while (cursor !== '0');

    logger.info('期限切れセッションのクリーンアップを完了しました', {
      cleanedCount
    });
  } catch (error) {
    logger.error('セッションクリーンアップ中にエラーが発生しました:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### 2.2 認証システムの強化

```typescript
// Redisベースのログイン試行管理
class LoginAttemptManager {
  private readonly redis: Redis;
  private readonly PREFIX = "login-attempt:";
  private readonly BLOCK_DURATION = 15 * 60; // 15分(秒)

  constructor(redis: Redis) {
    this.redis = redis;
  }

  private getKey(email: string): string {
    return `${this.PREFIX}${email}`;
  }

  async checkAttempts(email: string): Promise<boolean> {
    const key = this.getKey(email);
    const attempts = await this.redis.get(key);

    if (!attempts) {
      await this.redis.set(key, "1", "EX", this.BLOCK_DURATION);
      return true;
    }

    const count = parseInt(attempts, 10);
    if (count >= MAX_LOGIN_ATTEMPTS) {
      return false;
    }

    await this.redis.incr(key);
    return true;
  }

  async resetAttempts(email: string): Promise<void> {
    await this.redis.del(this.getKey(email));
  }
}
```

### 2.3 APIエンドポイント改善

```typescript
// 共通のミドルウェア関数
async function withErrorHandler(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // メソッドチェック
    if (!ALLOWED_METHODS.includes(req.method)) {
      return new NextResponse(
        JSON.stringify({
          error: `Method ${req.method} Not Allowed`,
        }),
        {
          status: 405,
          headers: {
            Allow: ALLOWED_METHODS.join(", "),
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({
          error: validationMessages.auth.required,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return await handler(req);
  } catch (error) {
    logger.error("APIエラーが発生しました", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: req.url,
    });
    return handleApiError(error);
  }
}
```

## 3. 実装スケジュール

### Week 1 (2/12-2/16)

- セッション管理の改善
  - Redis SCAN ベースのクリーンアップ実装
  - セッション再生成ロジックの最適化
  - ユニットテスト作成

### Week 2 (2/19-2/23)

- 認証システム強化
  - Redis ベースのログイン試行管理実装
  - セッショントークン管理の改善
  - セキュリティテスト実施

### Week 3 (2/26-3/1)

- APIエンドポイント改善
  - 共通ミドルウェアの実装
  - N+1問題の解消
  - パフォーマンステスト実施

## 4. リスク評価

1. **データ整合性リスク**

   - Redis クラスタ環境での動作検証が必要
   - セッションデータの移行計画の策定

2. **パフォーマンスリスク**

   - 大規模データでのSCAN操作の影響評価
   - キャッシュ戦略の見直し

3. **セキュリティリスク**
   - トークン生成・検証ロジックの強化
   - レート制限の適切な設定

## 5. 承認依頼事項

1. Redis SCAN ベースのセッション管理への移行
2. ログイン試行管理のRedis実装
3. APIミドルウェアの共通化
4. 実装スケジュールの妥当性

## 6. モニタリング計画

1. **パフォーマンスメトリクス**

   - Redisオペレーションのレイテンシ
   - セッション数とクリーンアップ効率
   - API レスポンスタイム

2. **セキュリティメトリクス**
   - ログイン試行失敗率
   - セッション異常終了数
   - 不正アクセス検知数

---

作成日: 2025/02/08
作成者: 開発チーム
