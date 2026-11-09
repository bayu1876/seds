module.exports = {
  apps: [
    {
      name: "sed-backend",
      script: "dist/server.js",
      cwd: "/srv/seds/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
    },
    {
      name: "sed-frontend",
      script: "pm2-start.js",
      cwd: "/srv/seds/frontend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PORT: 3002,
        NODE_ENV: "production",
      },
    },
  ],
};
