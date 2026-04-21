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
      },
      max_memory_restart: '512M',
      time: true
    }
  ]
};
