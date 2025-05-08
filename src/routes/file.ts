import Router from 'koa-router'
import fse from 'fs-extra'

import { join, resolve } from '../utils/file'

const router = new Router({ prefix: '/api/file' })

const TEMP_DIR = resolve('temp')
const UPLOAD_DIR = resolve('upload')

export interface Hash {
  hash: string
}

export interface Chunk extends Hash {
  index: number
  file?: Blob
}

export interface Merge extends Hash {
  name: string
  chunks: number
}

export interface Name {
  name: string
}

router.post('/upload', async (ctx) => {
  try {
    const { hash, index } = ctx.request.body as Chunk
    const file = (ctx.request as any).files.file
    const dir = join(TEMP_DIR, hash)
    const destPath = dir + '/' + index.toString()
    await fse.move(file.filepath, destPath, { overwrite: true })
    ctx.body = { hash, index, success: true }
  } catch (e: any) {
    ctx.body = { msg: e.message, success: false }
  }
})

router.post('/state', async (ctx) => {
  try {
    const { hash } = ctx.request.body as Hash
    const dir = join(TEMP_DIR, hash)
    let uploaded: number[] = []
    if (fse.existsSync(dir)) {
      const files = await fse.readdir(dir)
      uploaded = files.map(name => Number(name)).filter(n => !isNaN(n))
    }
    ctx.body = { uploaded, success: true }
  } catch (e: any) {
    ctx.body = { msg: e.message, success: false }
  }
})

router.post('/merge', async (ctx) => {
  try {
    const { hash, chunks, name } = ctx.request.body as Merge
    const dir = join(TEMP_DIR, hash)
    const finalPath = UPLOAD_DIR + '/' + name
    const writeStream = fse.createWriteStream(finalPath)
    for (let i = 0; i < chunks; i++) {
      const chunkPath = dir + '/' + i.toString()
      const data = fse.readFileSync(chunkPath)
      writeStream.write(data)
      fse.unlinkSync(chunkPath)
    }
    writeStream.end()
    ctx.body = { success: true, url: `/` + name }
  } catch (e: any) {
    ctx.body = { msg: e.message, success: false }
  }
})

router.post('/exists', async (ctx) => {
  try {
    const { name } = ctx.request.body as Name
    const finalPath = UPLOAD_DIR + '/' + name
    const exists = fse.existsSync(finalPath)
    ctx.body = { state: exists, success: false }
  } catch (e: any) {
    ctx.body = { msg: e.message, success: false }
  }
})

export default router

