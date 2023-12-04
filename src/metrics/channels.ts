import type { Context } from 'koishi'
import { $ } from 'koishi'
import type { OpenMetricsContentType, Registry } from 'prom-client'
import { Gauge } from 'prom-client'
import type { Config } from '../common'
import { metricNames, prefix } from '../common'

export const channels = (
  ctx: Context,
  config: Config,
  register: Registry<OpenMetricsContentType>,
) => {
  new Gauge({
    name: prefix + metricNames.channels,
    help: 'Total channels.',
    registers: [register],
    labelNames: ['instance_name'],
    async collect() {
      const channels = await ctx.database
        .select('channel')
        .execute((x) => $.length(x.id))

      this.set(
        {
          instance_name: config.name,
        },
        channels,
      )
    },
  })
}
