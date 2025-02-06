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
        // Core Web Vitals
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Performance metrics
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Server Components specific
        'server-response-time': ['error', { maxNumericValue: 100 }],
        'mainthread-work-breakdown': ['error', { maxNumericValue: 2000 }],
        
        // Security
        'installable-manifest': ['error', { minScore: 1 }],
        'uses-http2': ['error', { minScore: 1 }],
        'uses-long-cache-ttl': ['error', { minScore: 0.9 }],
        'dom-size': ['error', { maxNumericValue: 1000 }],
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