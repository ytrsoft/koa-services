import path from 'path'

import Koa from 'koa'
import KoaBody from 'koa-body'
import KoaStatic from 'koa-static'

import Router from 'koa-router'

import fileRouter from './routes/file'

const app = new Koa()

app.use(KoaBody({
  multipart: true,
  formidable: {
    uploadDir: path.resolve('temp'),
    keepExtensions: true
  }
}))

const router = new Router()

router.use(fileRouter.routes())
router.use(fileRouter.allowedMethods())

app.use(router.routes())
app.use(router.allowedMethods())

app.use(KoaStatic(
  path.resolve('upload')
))

app.listen(8080, () => {
  console.log('> 已启动 8080')
})

