import type { Context } from 'koishi'
import { $ } from 'koishi'
import type { OpenMetricsContentType, Registry } from 'prom-client'
import { Gauge } from 'prom-client'
import type { Config } from '../common'
import { getDate, metricNames, prefix } from '../common'

declare module 'koishi' {
  interface Tables {
    exporter_dau: DAU
  }
}

interface DAU {
  user: number
  date: number
  count: number
}

export const dau = (
  ctx: Context,
  config: Config,
  register: Registry<OpenMetricsContentType>,
) => {
  const dauBuffer: {
    platform: string
    userId: string
  }[] = []

  ctx.model.extend(
    'exporter_dau',
    {
      user: {
        type: 'unsigned',
        nullable: false,
      },
      date: {
        type: 'unsigned',
        nullable: false,
      },
      count: {
        type: 'unsigned',
        nullable: false,
      },
    },
    {
      primary: ['user', 'date'],
      unique: [['user', 'date']],
    },
  )
  ctx.on('message-created', ({ platform, userId }) =>
    dauBuffer.push({
      platform,
      userId,
    }),
  )
  new Gauge({
    name: prefix + metricNames.dau,
    help: 'Daily active user.',
    registers: [register],
    labelNames: ['instance_name'],
    async collect() {
      // Get current date
      const date = getDate(ctx)

      // Get all items from buffer
      const items = dauBuffer.concat()

      if (items.length) {
        // Reset buffer
        dauBuffer.length = 0

        // Get all user ids
        const ids = await ctx.database.get(
          'binding',
          {
            $or: items.map((x) => ({
              platform: [x.platform],
              pid: [x.userId],
            })),
          },
          ['aid'],
        )

        // Insert all user ids for current date
        await ctx.database.upsert(
          'exporter_dau',
          ids.map(({ aid }) => ({
            user: aid,
            date,
            count: 0,
          })),
        )
      }

      // Get all records of current date
      const dau = await ctx.database
        .select('exporter_dau')
        .where({
          date: [date],
        })
        .execute((x) => $.count(x.user))

      // Set DAU to length
      this.set(
        {
          instance_name: config.name,
        },
        dau,
      )
    },
  })
}
