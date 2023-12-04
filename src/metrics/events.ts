import type { Context } from 'koishi'
import type { OpenMetricsContentType, Registry } from 'prom-client'
import { Counter } from 'prom-client'
import type { Config } from '../common'
import { getHour, metricNames, prefix } from '../common'

export const events = (
  ctx: Context,
  config: Config,
  register: Registry<OpenMetricsContentType>,
) => {
  const e = new Counter({
    name: prefix + metricNames.events,
    help: 'Events that emitted.',
    registers: [register],
    labelNames: ['instance_name', 'event_type', 'event_name', 'hour'],
  })

  ctx.on('internal/event', (event_type, event_name) => {
    e.inc({
      instance_name: config.name,
      event_type,
      event_name,
      hour: getHour(ctx),
    })
  })
}
