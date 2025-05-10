module.exports = {
    apps : [{
      name   : "Backend Grid ERP [DEV] - PORT: 5000",
      script : "./dist/apps/core/main.js",
      cron_restart: "0 3 * * *",
      env: {
        NODE_ENV: "dev",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "prod",
        PORT: 5001
      }
    }]
  }
  