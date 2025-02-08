#!/bin/bash

# テスト環境の完全初期化スクリプト
# 統合指示文書セクション21に基づく実装

echo "テスト環境の初期化を開始します..."

# 1. データベースの再作成
echo "1. データベースを再作成しています..."
# prisma migrate resetを使用してデータベースをリセット
npx prisma migrate reset --force --skip-seed

# スキーマの再適用
echo "1.1 スキーマを適用しています..."
npx prisma db push

# 2. Redisの全キーを削除
echo "2. Redisのキーを削除しています..."
# 各パターンごとに個別にSCAN & DELを実行
redis-cli KEYS "opus_test:*" | xargs -r redis-cli DEL
redis-cli KEYS "session:*" | xargs -r redis-cli DEL
redis-cli KEYS "user-sessions:*" | xargs -r redis-cli DEL
redis-cli KEYS "rate-limit:*" | xargs -r redis-cli DEL
redis-cli KEYS "login-attempts:*" | xargs -r redis-cli DEL

# 3. テスト用ディレクトリのクリーンアップ
echo "3. テスト関連ディレクトリをクリーンアップしています..."
rm -rf test-results/*
rm -rf playwright-report/*
rm -rf e2e/.auth/*

# 必要なディレクトリを作成
mkdir -p test-results/videos
mkdir -p e2e/.auth
mkdir -p playwright-report

# 4. 環境変数の再読み込み確認
echo "4. 環境変数を確認しています..."
if [ ! -f .env.test ]; then
    echo "エラー: .env.test ファイルが見つかりません"
    exit 1
fi

# 5. Node.jsプロセスの停止
echo "5. テスト関連プロセスを停止しています..."
pkill -f "next dev"
pkill -f playwright

echo "初期化が完了しました。テストを開始できます。"
echo "注意: 統合指示文書セクション21に従い、この後テストプロセスを再起動してください。"