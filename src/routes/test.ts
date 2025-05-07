import Router, { RouterContext } from 'koa-router'

const router = new Router({ prefix: '/api/test' })

router.get('/', async (ctx: RouterContext) => {
  ctx.body = {
    msg: '连接成功'
  }
})

export default router
