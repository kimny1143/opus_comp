module.exports = {
  ci: {
    collect: {
      // 静的サイトのビルド出力を使用
      staticDistDir: './html',
      // または開発サーバーを使用
      // startServerCommand: 'npm run dev',
      // url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        // クローム起動オプション
        chromeFlags: '--no-sandbox --headless',
        // スロットリング設定
        throttling: {
          cpuSlowdownMultiplier: 4,
          networkSlowdownMultiplier: 2,
        },
        // スクリーンショット
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      // パフォーマンス基準
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // First Contentful Paint
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        // Largest Contentful Paint
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        // Time to Interactive
        'interactive': ['error', { maxNumericValue: 3000 }],
        // Total Blocking Time
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        // Cumulative Layout Shift
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      // アップロード先の設定
      target: 'temporary-public-storage',
      // または独自のサーバーを使用
      // target: 'lhci',
      // serverBaseUrl: 'http://your-lhci-server.example.com',
    },
    server: {
      // ローカルサーバーの設定
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './.lighthouseci/db.sql',
      },
    },
  },
}