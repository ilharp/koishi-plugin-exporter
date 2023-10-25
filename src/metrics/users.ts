import type { Context } from 'koishi'
import { $ } from 'koishi'
import type { OpenMetricsContentType, Registry } from 'prom-client'
import { Gauge } from 'prom-client'
import type { Config } from '../common'
import { metricNames, prefix } from '../common'

export const users = (
  ctx: Context,
  config: Config,
  register: Registry<OpenMetricsContentType>,
) => {
  new Gauge({
    name: prefix + metricNames.users,
    help: 'Total user.',
    registers: [register],
    labelNames: ['instance_name'],
    async collect() {
      const users = await ctx.database
        .select('user')
        .execute((x) => $.count(x.id))

      this.set(
        {
          instance_name: config.name,
        },
        users,
      )
    },
  })
}
