import Router, { RouterContext } from 'koa-router'
import { format } from 'date-fns'

const router = new Router({ prefix: '/api/nearby' })

const generatePosts = (count: number = 1000) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    user: `用户${i + 1}`,
    content: `这是用户 ${i + 1} 发布的动态内容`,
    image: `https://picsum.photos/seed/${i}/200/${Math.floor(Math.random() * 200) + 150}`,
    location: {
      lat: 39.9 + Math.random() * 0.1,
      lng: 116.3 + Math.random() * 0.1,
    },
    timestamp: Date.now() - i * 1000 * 60,
  }))
}

const F = (timestamp: number) => {
  return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss')
}

const processPosts = (posts: any[]) => {
  return posts.map(post => ({
    ...post,
    timestamp: F(post.timestamp),
  }))
}

const posts = generatePosts()

router.get('/', async (ctx: RouterContext) => {
  try {
    ctx.body = {
      data: processPosts(posts),
      success: true,
    }
  } catch (error: any) {
    ctx.status = 500
    ctx.body = {
      message: error.message,
      success: false,
    }
  }
})

export default router
