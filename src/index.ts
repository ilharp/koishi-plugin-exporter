import type { Context } from 'koishi'
import { Schema } from 'koishi'
import type { OpenMetricsContentType } from 'prom-client'
import {
  Registry,
  collectDefaultMetrics,
  openMetricsContentType,
} from 'prom-client'
import type { Config as ExporterConfig } from './common'
import { channels } from './metrics/channels'
import { commands } from './metrics/commands'
import { dau } from './metrics/dau'
import { events } from './metrics/events'
import { users } from './metrics/users'

export const name = 'exporter'

export const inject = {
  required: ['router'],
  optional: ['database', 'monetary'],
}

export const Config: Schema<ExporterConfig> = Schema.intersect([
  Schema.object({
    name: Schema.string()
      .default('default')
      .description('Name of this instance.'),
    path: Schema.string()
      .default('/metrics')
      .description('Path under which to expose metrics.'),
  }).description('Basic Settings'),
])

export function apply(ctx: Context, config: ExporterConfig) {
  const register = new Registry<OpenMetricsContentType>()
  register.setContentType(openMetricsContentType)

  collectDefaultMetrics({
    register,
    labels: {
      instance_name: config.name,
    },
  })

  ctx.router.get(config.path, async (ctx) => {
    try {
      ctx.body = await register.metrics()
      ctx.type = register.contentType
    } catch (err) {
      ctx.status = 500
      ctx.body = err
    }
  })

  events(ctx, config, register)
  commands(ctx, config, register)
  ctx.inject(['database'], (ctx) => {
    dau(ctx, config, register)
    users(ctx, config, register)
    channels(ctx, config, register)
  })
}
