module.exports = {
  apps: [
    {
      name: "next-pages-template",
      cwd: __dirname,
      script: "node",
      args: "node_modules/next/dist/bin/next start -p 3100",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "3100",
      },
    },
  ],
};
