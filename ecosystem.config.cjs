module.exports = {
  apps: [
    {
      name: 'plannos',
      cwd: '/var/www/plannos',
      script: './node_modules/.bin/tsx',
      args: 'server.ts',
      env: {
        NODE_ENV: 'production',
        PORT: '3201'
        // Secrets: set via .env on the server or PM2 ecosystem secret management
        // Required: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, HOTMART_HOTTOK
        // Firebase: GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_BASE64
      },
      max_memory_restart: '512M',
      time: true
    }
  ]
};
