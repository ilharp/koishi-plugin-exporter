import type { Context } from 'koishi'
import type { OpenMetricsContentType, Registry } from 'prom-client'
import { Counter } from 'prom-client'
import type { Config } from '../common'
import { getHour, metricNames, prefix } from '../common'

export const commands = (
  ctx: Context,
  config: Config,
  register: Registry<OpenMetricsContentType>,
) => {
  const c = new Counter({
    name: prefix + metricNames.commands,
    help: 'Commands that executed.',
    registers: [register],
    labelNames: ['instance_name', 'command_name', 'hour'],
  })

  ctx.on('command/before-execute', ({ command }) => {
    const [command_name] = command.name.split('.', 1)
    c.inc({
      instance_name: config.name,
      command_name,
      hour: getHour(ctx),
    })
  })
}
