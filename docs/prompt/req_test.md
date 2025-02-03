# テスト要件 (公式仕様)

- ユニットテスト/コンポーネントテスト → Vitest
- E2Eテスト → Playwright
- Jestへの移行禁止、既存Jest環境は廃止
- .env.test 運用ルール (CIでも同じキーを使う)
- vitest.config の基本設定
- maxWorkers=50%, testTimeout=30000ms など
- Playwrightでの認証テストやスクリーンショット保存方法
- CI統合時の注意点

## 参考

- テストの具体的な運用手順やサンプルコード、よくあるトラブルシュートは [test-guide.md](./test-guide.md) を参照。

---

## テストフレームワークの指定

- メインのテストランナーとして Vitest を使用する。
- E2E（エンドツーエンド）テストには Playwright を採用し、統合テストやUI検証を包括的に行う。
- 既存の Jest 環境は廃止または利用停止。新しく Jest に置き換えるなどの移行は検討しない。

---

## テスト環境と設定

1. テスト実行時は、以下の2種類のテストを基本的に分けて運用する:

   - ユニットテスト/コンポーネントテスト: Vitest のみによる実行
   - E2Eテスト: Playwright で実行

2. 環境変数の管理ルール:

   - 開発/ローカル用として .env.local 等を利用する。
   - テスト専用の値は .env.test に記載し、NODE_ENV=test のときのみ読み込む。
   - CI上でも .env.test を使用できるようにし、秘匿情報が必要な場合はGitHub Actions等で安全に管理する。

3. Vitest の設定（例: vitest.config.ts）:
   - environment は "jsdom" をデフォルトとする。
   - setupFiles には jest.setup.ts または vitest.setup.ts （名前はプロジェクトによる）を指定して、テスト前の初期化処理をまとめる。
   - testTimeout は長め(例: 30000ms)に設定し、大規模テストでもタイムアウトしにくくする。
   - maxWorkers などの並列数は使用環境に応じて可変だが、50%を推奨とする。

下記のようなイメージ:

```typescript
// vitest.config.ts の例
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./jest.setup.ts"],
    testTimeout: 30000,
    maxWorkers: "50%",
  },
});
```

---

## Playwright でのE2Eテスト

1. 画面遷移やSSR/CSRのハイドレーションを検証する場合は、Playwrightの waitForLoadState や waitForURL、waitForSelector などを活用して、描画完了を待機してからアサーションを行う。
2. 認証テストでは storageState の活用や auth.setup.ts などの事前セットアップを行い、認証済み状態を使い回すスムーズなE2Eを実現する。
3. タイムアウト値は適宜調整し、CI環境でも安定して通るように設定する。 （初期値は 30秒～60秒を想定）
4. スクリーンショットやHTMLスナップショットの保存先は test-results/ 以下など、プロジェクト内で一元管理する。
5. 並列実行の場合は test.describe.configure({ mode: 'parallel' }) などを利用してテスト間の干渉がないことを前提とする。

---

## その他の重要ルール

1. テストに用いるモック（mockSession など）は、開発／テスト環境専用とし、本番環境には影響しないよう実装上明確に区別する。
2. パフォーマンス計測やロードテストについてはこの構成に含めるが、追加で k6 等を使う場合は別途検討する。現時点では Vitest + Playwright の枠内で軽負荷のパフォーマンステストを行うにとどめる。
3. フレームワークの移行（Jest → Vitest など）はすでに完了したとみなし、再度の移行や新しいテストランナーの導入は行わない。
4. テストの安定化やモックの実装方針など、ここで規定した以上の変更を希望する場合は、必ず管理者に事前承認を求める。

---

## 結論

- テストは「Vitest + Playwright」の構成を正式に維持・最適化する。
- Jestなど他のテストランナーへの切り替えは行わない。
- .env.test を中心に環境変数を整理し、CIでも一貫して使用する。
- タイムアウトや並列実行の設定はプロジェクト全体の安定性・パフォーマンスを考慮しつつ適宜更新する。

以上が正式なテスト仕様なので、エージェントはこの方針を厳守して作業を進めてね。変更提案は事前相談が必須となるよ。
