# GitHub Actions 自动部署

这个项目已经接入了 GitHub Actions 自动部署。

## 发布流程

当你向 `main` 或 `master` 分支执行 `git push` 时，GitHub Actions 会自动通过 SSH 登录服务器，并按下面顺序执行：

```bash
BRANCH=<当前分支>
git fetch origin "$BRANCH"
git switch "$BRANCH" || git switch -c "$BRANCH" --track "origin/$BRANCH"
git pull origin "$BRANCH"
pnpm install --frozen-lockfile
pnpm build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

## 需要配置的 GitHub Secrets

在仓库的 `Settings -> Secrets and variables -> Actions` 里添加：

- `DEPLOY_HOST`：服务器 IP 或域名
- `DEPLOY_PORT`：SSH 端口，比如 `22`
- `DEPLOY_USER`：SSH 登录用户
- `DEPLOY_SSH_KEY`：对应用户的私钥内容
- `DEPLOY_PATH`：服务器上的项目目录，比如 `/www/wwwroot/next-pages-template`

## 服务器前置要求

服务器上需要提前准备好：

```bash
node -v
pnpm -v
pm2 -v
```

并且保证：

1. 服务器里的项目目录已经 `git clone` 过这个仓库
2. 服务器可以正常 `git pull`
3. `ecosystem.config.cjs` 对应的 PM2 进程名可直接复用
4. `.env.production` 已经放在服务器项目目录中

## 首次部署建议

第一次先在服务器手动执行一次，确认环境没有问题：

```bash
cd /你的项目目录
pnpm install
pnpm build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

完成后，以后通常只需要推代码：

```bash
git push
```