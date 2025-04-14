import Router, { RouterContext } from 'koa-router'
import { AppDataSource } from '../config/data-source'
import { User } from '../models/user'

const router = new Router({ prefix: '/api/users' })

router.get('/', async (ctx: RouterContext) => {
  const userRepository = AppDataSource.getRepository(User)
  const users = await userRepository.find()
  ctx.body = users
})

router.get('/:id', async (ctx: RouterContext) => {
  const userRepository = AppDataSource.getRepository(User)
  const user = await userRepository.findOneBy({ id: parseInt(ctx.params.id) })
  if (!user) {
    ctx.status = 404
    ctx.body = { message: '未找到用户' }
    return
  }
  ctx.body = user
})

router.post('/', async (ctx: RouterContext) => {
  const userRepository = AppDataSource.getRepository(User)
  const { name, email } = ctx.request.body as Partial<User>
  if (!name || !email) {
    ctx.status = 400
    ctx.body = { message: '必须包含姓名和邮件' }
    return
  }
  const user = userRepository.create({ name, email })
  await userRepository.save(user)
  ctx.status = 201
  ctx.body = user
})

router.put('/:id', async (ctx: RouterContext) => {
  const userRepository = AppDataSource.getRepository(User)
  const user = await userRepository.findOneBy({ id: parseInt(ctx.params.id) })
  if (!user) {
    ctx.status = 404
    ctx.body = { message: '未找到用户' }
    return
  }
  const { name, email } = ctx.request.body as Partial<User>
  if (name) user.name = name
  if (email) user.email = email
  await userRepository.save(user)
  ctx.body = user
})

router.delete('/:id', async (ctx: RouterContext) => {
  const userRepository = AppDataSource.getRepository(User)
  const user = await userRepository.findOneBy({ id: parseInt(ctx.params.id) })
  if (!user) {
    ctx.status = 404
    ctx.body = { message: '未找到用户' }
    return
  }
  await userRepository.remove(user)
  ctx.status = 204
})

export default router
