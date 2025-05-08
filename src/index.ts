import Koa from 'koa'

import KoaBody from 'koa-body'

import Router from 'koa-router'

import { mkdir } from './utils'

import fileRouter from './routes/file'

export const tmp = (...args: Array<string>) => {
  return mkdir(__dirname, 'tmp', ...args)
}

export const upload = (...args: Array<string>) => {
  return mkdir(__dirname, 'upload', ...args)
}

const app = new Koa()

app.use(KoaBody({
  multipart: true,
  formidable: {
    uploadDir: tmp()
  }
}))

const router = new Router()

router.use(fileRouter.routes())
router.use(fileRouter.allowedMethods())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(8080, () => {
  console.log('> 已启动 8080')
})

