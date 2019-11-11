import http from 'http'
import Telegraf from 'telegraf'
import { start, onMessage, onEditMessage } from './middlewares'
import { Server } from 'http'
import { Update } from 'telegram-typings'

declare module 'telegraf' {
  export interface Telegram {
    getUpdates(
      timeout: number | undefined,
      limit: number,
      offset: number,
      allowedUpdates?: string[]
    ): Update[]
  }
}

const {
  NODE_ENV,
  BOT_TOKEN,
  BOT_USERNAME,
  BOT_WEBHOOK_PATH,
  BOT_WEBHOOK_PORT,
  BOT_WEBHOOK_HOST,
  PORT
} = process.env

const DEV = process.env.NODE_ENV === 'development'
export function log(data: any): void {
  if (DEV) {
    if (typeof data === 'object') {
      console.dir(data, { depth: 10 })
    } else {
      console.log('\r > ' + data)
    }
  }
}

const bot = new Telegraf(BOT_TOKEN!, {
  username: BOT_USERNAME!,
  telegram: {
    webhookReply: true
  }
})

bot.start(start)
bot.on('message', onMessage)
bot.on('edited_message', onEditMessage)

let server: Server
async function main(): Promise<void> {
  await bot.stop()
  await bot.telegram.deleteWebhook()
  let lastUpdateID = 0
  const getUpdateRec = async (): Promise<void> => {
    const newUpdate = await bot.telegram.getUpdates(
      undefined,
      100,
      lastUpdateID + 1
    )
    if (newUpdate.length > 0) {
      // eslint-disable-next-line require-atomic-updates
      lastUpdateID = newUpdate[newUpdate.length - 1].update_id
      log(`Fetched old updates: ${lastUpdateID}`)
      await getUpdateRec()
    }
  }

  await getUpdateRec()
  if (NODE_ENV === 'development') {
    bot.startPolling()
  } else if (NODE_ENV === 'production') {
    const whURL = `https://${BOT_WEBHOOK_HOST}:${BOT_WEBHOOK_PORT}${BOT_WEBHOOK_PATH}`
    log(`Webhook set onto ${whURL}`)
    bot.telegram.setWebhook(whURL)
    server = http.createServer(bot.webhookCallback(BOT_WEBHOOK_PATH!))
    server.listen(PORT, () => console.log(`Server listening on :${PORT}`))
  }
  log(`Bot works in ${NODE_ENV} mode`)
}

function interrupt(): void {
  log('Starting graceful shutdown')
  if (server) {
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  } else process.exit(0)
}

main() //.catch(interrupt)

process.on('SIGINT', interrupt)
process.on('SIGTERM', interrupt)
// process.on('unhandledRejection', interrupt)
