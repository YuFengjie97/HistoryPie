import { resolve } from 'node:path'

export const isDev = process.env.NODE_ENV !== 'production'
export const r = (...args: string[]) => resolve(__dirname, '..', ...args)
