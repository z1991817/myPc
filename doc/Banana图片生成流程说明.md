# Banana 图片生成流程说明

## 1. 适用范围
- 页面：`/createNew`
- 模型：Nano Banana 系列（即非 GPT 模型）
- 模式：`text-to-image`、`image-to-image`

## 2. 总体流程
1. 前端调用 `POST /app/banana-CreateImage` 创建任务。
2. 从创建接口响应中读取：
   - `data.upload.taskId`
   - `data.upload.queryPath`
3. 前端按固定间隔轮询 `data.upload.queryPath`。
4. 当状态接口返回 `status=success` 时：
   - 读取 `data.previewUrl` 作为页面展示图（优先）
   - 读取 `data.cosUrl` 作为原图地址（下载/大图预览使用）
5. 若未返回 `previewUrl`，展示自动回退到 `cosUrl`。

## 3. 接口约定

### 3.1 创建任务接口
- URL：`POST /app/banana-CreateImage`
- 请求参数：
  - `model: string`
  - `prompt: string`
  - `aspectRatio: string`
  - `type: "text-to-image" | "image-to-image"`
  - `imageUrls?: string[]`（仅图生图）
- 关键返回字段：
  - `data.upload.taskId: string`
  - `data.upload.queryPath: string`

### 3.2 状态查询接口
- URL：`GET {queryPath}`（由创建接口返回）
- 关键返回字段：
  - `data.status: string`
  - `data.previewUrl?: string`
  - `data.cosUrl?: string`

## 4. 前端轮询策略（当前实现）
- 轮询间隔：`2000ms`
- 最大轮询次数：`90`
- 最大等待时长：约 `180s`

状态处理：
- `success`：结束轮询，取图地址
- `failed | fail | error | cancelled`：结束轮询，按失败处理
- 其他状态：继续轮询直到成功或超时

超时处理：
- 超过最大轮询次数后提示：`生成超时，请稍后重试（任务ID: xxx）`

## 5. 展示与下载策略
- 卡片展示图：优先 `previewUrl`，回退 `cosUrl`
- 点击大图预览：使用 `cosUrl`
- 下载图片：使用 `cosUrl`

## 6. 性能优化（已接入）
1. 首图高优先级加载：首张结果图 `eager`，其余 `lazy`
2. 预连接：页面增加 `preconnect/dns-prefetch` 到 `claude.artimg.top`
3. 图片预热：轮询成功后立即预热 `previewUrl/cosUrl`

## 7. 代码位置
- 接口定义：`api/images.ts`
  - `bananaCreateImage`
  - `bananaQueryImage`
  - `BananaQueryImageResponse`
- 页面逻辑：`pages/createNew/index.tsx`
  - `waitForBananaImage`
  - Banana 文生图/图生图分支
  - `GeneratedImage`（`url/sourceUrl`）

## 8. 补充说明
- 上传图片成功后，前端会先对返回的 `url` 执行 `normalizeImageURL`，保证拼接 base URL 后再使用。
- `previewUrl` 仅用于“更快显示”，最终质量以 `cosUrl` 为准。
