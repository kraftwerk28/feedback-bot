import http from 'http'
import Telegraf from 'telegraf'
import { start, all } from './middlewares'
import { Server } from 'https';

declare module 'telegraf' {
  export interface Telegram {
    getUpdates(
      timeout: number | undefined,
      limit: number,
      offset: number,
      allowedUpdates?: string[]
    ): any[]
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

const bot = new Telegraf(BOT_TOKEN!, {
  username: BOT_USERNAME!,
  telegram: {
    webhookReply: true
  }
})

bot.start(start)
bot.on('message', all)

let server: any
async function main() {
  bot.stop()
  await bot.telegram.deleteWebhook()
  let lastUpdateID = 0
  const getUpdateRec = async () => {
    const newUpdate = await bot.telegram.getUpdates(
      undefined,
      100,
      lastUpdateID + 1
    )
    if (newUpdate.length > 0) {
      // eslint-disable-next-line require-atomic-updates
      lastUpdateID = newUpdate[newUpdate.length - 1].update_id
      console.log(`Fetched old updates: ${lastUpdateID}`)
      await getUpdateRec()
    }
  }

  await getUpdateRec()
  bot.stop()
  if (NODE_ENV === 'development') {
    bot.startPolling()
  } else {
    const whURL = `https://${BOT_WEBHOOK_HOST}:${BOT_WEBHOOK_PORT}${BOT_WEBHOOK_PATH}`
    console.log(`Webhook set onto ${whURL}`)
    bot.telegram.setWebhook(whURL)
    server = http.createServer(bot.webhookCallback(BOT_WEBHOOK_PATH!))
    server.listen(PORT)
  }
  console.log(`Bot works in ${NODE_ENV} mode...`)
}

main().catch(interrupt)

function interrupt() {
  bot.stop()
  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGINT', interrupt)
process.on('SIGTERM', interrupt)
process.on('unhandledRejection', interrupt)
