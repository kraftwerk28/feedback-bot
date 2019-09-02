import Telegraf from 'telegraf'
import { start, all } from './middlewares'

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
  BOT_WEBHOOK_HOST
} = process.env

const bot = new Telegraf(BOT_TOKEN!, {
  username: BOT_USERNAME!,
  telegram: {
    webhookReply: true
  }
})

bot.start(start)
bot.on('message', all)

async function main() {
  bot.stop()
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
    bot.startWebhook(
      BOT_WEBHOOK_PATH!,
      null,
      +BOT_WEBHOOK_PORT!,
      BOT_WEBHOOK_HOST
    )
  }
  console.log(`Bot works in ${NODE_ENV} mode...`)
}

main().catch(interrupt)

function interrupt() {
  bot.stop()
  process.exit(0)
}

process.on('SIGINT', interrupt)
process.on('SIGTERM', interrupt)
process.on('unhandledRejection', interrupt)
