import type { Context } from 'koishi'

export interface Config {
  name: string
  path: string
}

export const prefix = 'koishi_'

const metricNamesIntl = [
  'events',
  'commands',
  'users',
  'channels',
  'dau',
  'dau_yesterday',
] as const

type ObjectFromList<T extends ReadonlyArray<string>> = {
  [K in T extends ReadonlyArray<infer U> ? U : never]: K
}

export const metricNames = metricNamesIntl.reduce(
  (a, c) => ((a[c] = c), a),
  {},
) as ObjectFromList<typeof metricNamesIntl>

export function getDateString(ctx: Context) {
  const d = new Date(
    new Date().getTime() -
      ctx.root.config['timezoneOffset'] *
        60 /* Seconds */ *
        1000 /* Milliseconds */,
  )
  const mm = d.getUTCMonth() + 1 // getUTCMonth() is zero-based
  const dd = d.getUTCDate()
  return `${d.getUTCFullYear()}${mm > 9 ? '' : '0'}${mm}${
    dd > 9 ? '' : '0'
  }${dd}`
}

export function getHour(ctx: Context) {
  return new Date(
    new Date().getTime() -
      ctx.root.config['timezoneOffset'] *
        60 /* Seconds */ *
        1000 /* Milliseconds */,
  ).getUTCHours()
}

export function yesterday(dateString: string) {
  const year = Number(dateString.slice(0, 4))
  const month = Number(dateString.slice(4, 6))
  const day = Number(dateString.slice(6, 8))
  const date = new Date(
    new Date(year, month - 1, day).getTime() - 24 * 60 * 60 * 1000,
  )
  const mm = date.getMonth() + 1
  const dd = date.getDate()
  return `${date.getFullYear()}${mm > 9 ? '' : '0'}${mm}${
    dd > 9 ? '' : '0'
  }${dd}`
}
