import 'reflect-metadata'

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'

import testRouter from './routes/test'
import fileRouter from './routes/file'

// import userRouter from './routes/user'

// import { AppDataSource } from './config/data-source'

const app = new Koa()

app.use(bodyParser())

const router = new Router()

router.use(testRouter.routes())
router.use(testRouter.allowedMethods())

router.use(fileRouter.routes())
router.use(fileRouter.allowedMethods())

app.use(router.routes())
app.use(router.allowedMethods())

// AppDataSource.initialize().then(() => {
//   app.listen(8080, () => {
//     console.log('> 已启动 8080')
//   })
// })

app.listen(8080, () => {
  console.log('> 已启动 8080')
})

