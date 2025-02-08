#!/bin/bash

# テスト環境の完全初期化スクリプト
# 統合指示文書セクション21に基づく実装

echo "テスト環境の初期化を開始します..."

# 1. データベースの再作成
echo "1. データベースを再作成しています..."
psql -h localhost -U test -d postgres -c "DROP DATABASE IF EXISTS opus_test;"
psql -h localhost -U test -d postgres -c "CREATE DATABASE opus_test;"

# スキーマの再適用
echo "1.1 スキーマを適用しています..."
npx prisma db push --schema=prisma/schema.prisma

# 2. Redisの全キーを削除
echo "2. Redisのキーを削除しています..."
redis-cli EVAL "return redis.call('del', unpack(redis.call('keys', 'opus_test:*')))" 0
redis-cli EVAL "return redis.call('del', unpack(redis.call('keys', 'session:*')))" 0
redis-cli EVAL "return redis.call('del', unpack(redis.call('keys', 'user-sessions:*')))" 0
redis-cli EVAL "return redis.call('del', unpack(redis.call('keys', 'rate-limit:*')))" 0
redis-cli EVAL "return redis.call('del', unpack(redis.call('keys', 'login-attempts:*')))" 0

# 3. テスト用ディレクトリのクリーンアップ
echo "3. テスト関連ディレクトリをクリーンアップしています..."
rm -rf test-results/*
rm -rf playwright-report/*
rm -rf e2e/.auth/*

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