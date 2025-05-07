import Router, { RouterContext } from 'koa-router'
import fs from 'fs-extra'
import path from 'path'

export interface Hash {
  hash: string
}

export interface Merge extends Hash {
  name: string
  chunks: number
}

export interface Chunck extends Hash {
  index: number
  file: File
}

const router = new Router({ prefix: '/api/file' })

const uploadDir = path.join(__dirname, 'uploads')
const mergedDir = path.join(__dirname, 'merged')

fs.ensureDirSync(uploadDir)
fs.ensureDirSync(mergedDir)

const getUpload = (files: Array<any>) => {
  return files.map((file) => {
    return parseInt(file.split('-')[1])
  })
}

// 检查
router.post('/state', async (ctx: RouterContext) => {
  const { hash } = ctx.request.body as Hash
  const filePath = path.join(mergedDir, `${hash}`)
  ctx.body = { exists: await fs.pathExists(filePath) }
})

// 续传
router.post('/next', async (ctx: RouterContext) => {
  const { hash } = ctx.request.body as Hash
  const chunkDir = path.join(uploadDir, hash)
  if (await fs.pathExists(chunkDir)) {
    const files = await fs.readdir(chunkDir)
    ctx.body = { uploaded: getUpload(files) }
  } else {
    ctx.body = { uploaded: [] }
  }
})

// 上传
router.post('/upload', async (ctx: RouterContext) => {
  const { hash } = ctx.request.body as Chunck
  const chunkDir = path.join(uploadDir, hash)
  if (await fs.pathExists(chunkDir)) {
    const files = await fs.readdir(chunkDir)
    ctx.body = { uploaded: getUpload(files) }
  } else {
    ctx.body = { uploaded: [] }
  }
})

// 合并
router.post('/merge', async (ctx: RouterContext) => {
  const { hash, name, chunks } = ctx.request.body as Merge
  const chunkDir = path.join(uploadDir, hash)
  const mergedFilePath = path.join(mergedDir, name)
  const writeStream = fs.createWriteStream(mergedFilePath)
  for (let i = 0; i < chunks; i++) {
    const chunkPath = path.join(chunkDir, `chunk-${i}`)
    const chunkBuffer = await fs.readFile(chunkPath)
    writeStream.write(chunkBuffer)
  }
  writeStream.end()
  await fs.remove(chunkDir)
  ctx.body = { url: `/merged/${name}` }
})

export default router
