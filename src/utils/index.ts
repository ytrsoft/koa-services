import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'

export const SUFFIX = '.data'

export const mkdir = (base: string, ...args: Array<string>) => {
  const p = path.join(base, ...args)
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true })
  }
  return p
}

export const move = async (src: string, dest: string) => {
  await fse.move(src, dest, { overwrite: true })
}

export const dataFiles = async (src: string) => {
  const files = await fse.readdir(src)
  const fs = files.filter((f) => {
    return f.endsWith(SUFFIX)
  }).map((f) => {
    return {
      file: f,
      index: parseInt(f.split('.')[0])
    }
  })
  fs.sort((prev, next) => prev.index - next.index)
  return fs
}

export const next = async (src: string) => {
  const files = await dataFiles(src)
  const uploaded = files.map((f) => f.index)
  const max = Math.max(...uploaded) + 1
  return uploaded.length ? max : 0
}

