import fs from 'fs'
import path from 'path'

export const resolve = (...args: string[]) => {
  const dir = path.resolve(...args)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export const join = (base: string, ...args: string[]) => {
  const dir = path.join(base, ...args)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}
