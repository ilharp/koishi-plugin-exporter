import type { Context } from 'koishi'

export interface Config {
  name: string
  path: string
}

export const prefix = 'koishi_'

export const metricNames = {
  events: 'events',
  commands: 'commands',
  dau: 'dau',
} as const

export function getDate(ctx: Context) {
  const d = new Date(
    new Date().getTime() -
      ctx.root.config['timezoneOffset'] *
        60 /* Seconds */ *
        1000 /* Milliseconds */,
  )
  const mm = d.getUTCMonth() + 1 // getUTCMonth() is zero-based
  const dd = d.getUTCDate()
  return Number(
    `${d.getUTCFullYear()}${mm > 9 ? '' : '0'}${mm}${dd > 9 ? '' : '0'}${dd}`,
  )
}
