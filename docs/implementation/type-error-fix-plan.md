# 認証機能改善実装計画

## 1. パスワードハッシュ化実装

### 1.1 必要なパッケージ

```bash
npm install bcryptjs
npm install @types/bcryptjs --save-dev
```

### 1.2 ユーティリティ関数の実装

```typescript
// src/utils/auth.ts
import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
```

### 1.3 ログイン API の修正

```typescript
// src/app/api/auth/login/route.ts
import { comparePassword } from "@/utils/auth";

// パスワード比較部分の修正
if (!user || !(await comparePassword(password, user.hashedPassword))) {
  return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
}
```

## 2. ロールベースアクセス制御実装

### 2.1 ミドルウェアの拡張

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 管理者のみアクセス可能なパス
const adminOnlyPaths = ["/admin", "/api/admin"];

// ロールチェック関数
const checkRole = (decoded: any, path: string): boolean => {
  if (adminOnlyPaths.some((p) => path.startsWith(p))) {
    return decoded.role === "ADMIN";
  }
  return true;
};

export async function middleware(request: NextRequest) {
  // ... 既存のトークン検証コード ...

  // ロールチェックを追加
  if (!checkRole(decoded, path)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  return NextResponse.next();
}
```

## 3. API ルート保護の実装

### 3.1 API ミドルウェア

```typescript
// src/middleware/apiAuth.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";

export async function withAuth(handler: Function, requiredRole?: string) {
  return async (req: NextRequest) => {
    const token = req.cookies.get("auth-token");

    if (!token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    try {
      const decoded = await decode({
        token: token.value,
        secret: process.env.NEXTAUTH_SECRET || "mvp-secret",
      });

      if (!decoded) {
        throw new Error("Invalid token");
      }

      if (requiredRole && decoded.role !== requiredRole) {
        return NextResponse.json(
          { error: "権限がありません" },
          { status: 403 }
        );
      }

      return handler(req, decoded);
    } catch (error) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }
  };
}
```

## 4. 実装手順

### Day 1 (4 時間)

1. bcryptjs のインストールとユーティリティ関数の実装
2. ログイン API の修正とテスト
3. 既存ユーザーのパスワード移行スクリプト作成

### Day 1 (4 時間)

4. ミドルウェアの拡張実装
5. API ルート保護の実装
6. E2E テストの追加

## 5. テスト計画

### 5.1 単体テスト

```typescript
// src/utils/__tests__/auth.test.ts
import { hashPassword, comparePassword } from "../auth";

describe("Auth Utils", () => {
  it("should hash password correctly", async () => {
    const password = "testPassword";
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).not.toBe(password);
    expect(await comparePassword(password, hashedPassword)).toBe(true);
  });
});
```

### 5.2 E2E テスト

```typescript
// cypress/e2e/auth.cy.ts
describe("Authentication", () => {
  it("should handle invalid credentials", () => {
    cy.visit("/login");
    cy.get('[data-testid="email"]').type("test@example.com");
    cy.get('[data-testid="password"]').type("wrongpassword");
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="error-message"]').should("be.visible");
  });

  it("should restrict admin routes", () => {
    cy.login("user@example.com", "password");
    cy.visit("/admin");
    cy.url().should("include", "/login");
  });
});
```

## 6. リスク対策

### 6.1 データ移行

- バックアップの作成
- 移行スクリプトのテスト実行
- 段階的な移行プロセス

### 6.2 エラー対策

- 詳細なエラーログの実装
- フォールバック機能の用意
- 移行失敗時の復旧手順

## 7. 成功基準

1. 全てのパスワードが bcrypt でハッシュ化されている
2. 権限チェックが全てのルートで正常に機能する
3. 全てのテストが成功する
4. エラーハンドリングが適切に機能する

以上の計画に基づいて実装を進めます。
