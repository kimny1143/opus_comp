#!/bin/bash

# データベースマイグレーションの実行
echo "Running database migrations..."
npx prisma migrate deploy

# テストデータのシード
echo "Seeding test data..."
npx prisma db seed

echo "Database setup completed." 