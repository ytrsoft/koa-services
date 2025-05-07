import Router from 'koa-router'
import fs from 'fs-extra'
import path from 'path'
import multer from '@koa/multer'

export interface Hash {
  hash: string
}

export interface Merge extends Hash {
  name: string
  chunks: number
}

export interface Chunck extends Hash {
  index: number
  file?: any
}

const router = new Router({ prefix: '/api/file' })
const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => {
      cb(null, path.join(__dirname, 'uploads-temp'))
    },
    filename: (_, file, cb) => {
      cb(null, file.originalname)
    }
  })
})

const uploadDir = path.join(__dirname, 'Uploads')
const mergedDir = path.join(__dirname, 'merged')

fs.ensureDirSync(uploadDir)
fs.ensureDirSync(mergedDir)

const getUpload = (files: Array<string>) => {
  return files.map((file) => parseInt(file.split('-')[1]))
}

router.post('/state', async (ctx) => {
  const { hash } = ctx.request.body as Hash
  const filePath = path.join(mergedDir, `${hash}`)
  ctx.body = { exists: await fs.pathExists(filePath) }
})

router.post('/next', async (ctx) => {
  const { hash } = ctx.request.body as Hash
  const chunkDir = path.join(uploadDir, hash)
  if (await fs.pathExists(chunkDir)) {
    const files = await fs.readdir(chunkDir)
    ctx.body = { uploaded: getUpload(files) }
  } else {
    ctx.body = { uploaded: [] }
  }
})

router.post('/upload', upload.single('file'), async (ctx) => {
  const file = (ctx.req as any).file

  const { hash, index } = ctx.request.body as Chunck

  if (!file || !hash || index === undefined) {
    ctx.status = 400
    ctx.body = { message: '参数丢失' }
    return
  }

  const chunkDir = path.join(uploadDir, hash)
  await fs.ensureDir(chunkDir)

  const chunkPath = path.join(chunkDir, `chunk-${index}`)
  await fs.move(file.path, chunkPath, { overwrite: true })

  ctx.body = { success: true, index }
})

router.post('/merge', async (ctx) => {
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
