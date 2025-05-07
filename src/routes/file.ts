import Router, { RouterContext } from 'koa-router'
import fs from 'fs-extra'
import path from 'path'

interface FileSlice {
  hash: string
  filename: string
  chunks: number
}

const router = new Router({ prefix: '/api/file' })

const uploadDir = path.join(__dirname, 'uploads')
const mergedDir = path.join(__dirname, 'merged')

fs.ensureDirSync(uploadDir)
fs.ensureDirSync(mergedDir)

// 检查
router.post('/state', async (ctx: RouterContext) => {
  const { hash } = ctx.request.body as { hash: string }
  const filePath = path.join(mergedDir, `${hash}`)
  ctx.body = { exists: await fs.pathExists(filePath) }
})

// 续传
router.post('/continue', async (ctx: RouterContext) => {
  const { hash } = ctx.request.body as { hash: string }
  const chunkDir = path.join(uploadDir, hash)
  if (await fs.pathExists(chunkDir)) {
    const files = await fs.readdir(chunkDir)
    const uploaded = files.map((file) => parseInt(file.split('-')[1]))
    ctx.body = { uploaded }
  } else {
    ctx.body = { uploaded: [] }
  }
})

// 上传
router.post('/upload', async (ctx: RouterContext) => {
  const { hash } = ctx.request.body as { hash: string }
  const chunkDir = path.join(uploadDir, hash)
  if (await fs.pathExists(chunkDir)) {
    const files = await fs.readdir(chunkDir)
    const uploaded = files.map((file) => parseInt(file.split('-')[1]))
    ctx.body = { uploaded }
  } else {
    ctx.body = { uploaded: [] }
  }
})

// 合并
router.post('/merge', async (ctx: RouterContext) => {
  const { hash, filename, chunks } = ctx.request.body as FileSlice
  const chunkDir = path.join(uploadDir, hash)
  const mergedFilePath = path.join(mergedDir, filename)

  const writeStream = fs.createWriteStream(mergedFilePath)
  for (let i = 0; i < chunks; i++) {
    const chunkPath = path.join(chunkDir, `chunk-${i}`)
    const chunkBuffer = await fs.readFile(chunkPath)
    writeStream.write(chunkBuffer)
  }
  writeStream.end()

  await fs.remove(chunkDir)
  ctx.body = { success: true, url: `/merged/${filename}` }
})

export default router
