import Router, { RouterContext } from 'koa-router'

const router = new Router({ prefix: '/api/nearby' })

const posts = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  user: `用户${i + 1}`,
  content: `这是用户 ${i + 1} 发布的动态内容`,
  image: `https://picsum.photos/seed/${i}/200/200`,
  location: {
    lat: 39.9 + Math.random() * 0.1,
    lng: 116.3 + Math.random() * 0.1,
  },
  timestamp: Date.now() - i * 1000 * 60
}))

router.get('/', async (ctx: RouterContext) => {
  ctx.body = {
    data: posts,
    success: true
  }
})

export default router
