import fs from 'fs'
import Router from 'koa-router'
import { tmp, upload } from '../index'
import { dataFiles, move, next } from '../utils'
import path from 'path'

export interface Hash {
  hash: string
}

export interface Next extends Hash {
  uploadId: string
}

export interface Merge extends Hash {
  name: string
  chunks: number
  uploadId: string
}

export interface Chunck extends Hash {
  index: number
  uploadId: string
}

const router = new Router({ prefix: '/api/file' })

router.post('/state', async (ctx) => {
  const { hash, uploadId } = ctx.request.body as Next
  if (!hash || !uploadId) {
    ctx.status = 400
    ctx.body = { error: '参数缺失' }
    return
  }
  const dist = tmp(uploadId, hash)
  let uploadedChunks: Array<number> = []
  try {
    const files = await dataFiles(dist)
    uploadedChunks = files.map((f) => f.index)
  } catch (e) {
    uploadedChunks = []
  }
  ctx.body = { uploaded: uploadedChunks }
})


router.post('/upload', async (ctx) => {
  const files = ctx.request.files
  const body = ctx.request.body as Chunck
  const { hash, index, uploadId } = body
  if (!files || !hash || index === undefined) {
    ctx.status = 400
    ctx.body = { message: '参数缺失' }
    return
  }
  const dist = tmp(uploadId, hash)
  const src = (files.file as any).filepath
  await move(src, `${dist}/${index}.data`)
  ctx.body = hash
})


router.post('/next', async (ctx) => {
  const { hash, uploadId } = ctx.request.body as Next
  if (!hash || !uploadId) {
    ctx.status = 400
    ctx.body = { error: '参数缺失' }
    return
  }
  const dist = tmp(uploadId, hash)
  try {
    ctx.body = { next: next(dist) }
  } catch (e) {
    ctx.body = { next: 0 }
  }
})

router.post('/merge', async (ctx) => {
  const { hash, name, chunks, uploadId } = ctx.request.body as Merge
  if (!hash || !name || !chunks || !uploadId) {
    ctx.status = 400
    ctx.body = { error: '参数缺失' }
    return
  }
  const dist = tmp(uploadId, hash)
  const files = await dataFiles(dist)
  const fileList = files.map((f) => {
    return dist + '/' + f.file
  })
  const src = upload()
  const file = `${src}/${name}`
  const writeStream = fs.createWriteStream(file)
  for (const chunkPath of fileList) {
    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(chunkPath)
      readStream.on('end', () => {
        fs.unlink(chunkPath, () => resolve())
      })
      readStream.on('error', reject)
      readStream.pipe(writeStream, { end: false })
    })
  }
  writeStream.end()
  fs.rmdirSync(dist)
  ctx.body = { name }
})

export default router
