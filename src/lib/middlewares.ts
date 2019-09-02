import { ContextMessageUpdate } from 'telegraf'
import { fromLang } from './i18n'

const { ADMIN_CHAT_ID: ACI } = process.env
const ADMIN_CHAT_ID = +ACI!

declare module 'telegraf' {
  export interface Telegram {
    forwardMessage(
      chatId: number,
      fromChatId: number,
      messageId: number,
      extra?: Extra
    ): void
  }
}

export async function start(ctx: ContextMessageUpdate) {
  const reply = fromLang('uk')('start')
  if (reply) {
    ctx.chat!.id
    ctx.reply(reply, { reply_to_message_id: ctx.message!.message_id })
  }
}

export async function all(ctx: ContextMessageUpdate) {
  ctx.telegram.sendMessage(
    ADMIN_CHAT_ID,
    `From: ${ctx.from!.username ? `@${ctx.from!.username}` : ctx.from!.first_name}`
  )
  ctx.telegram.forwardMessage(
    ADMIN_CHAT_ID,
    ctx.chat!.id,
    ctx.message!.message_id
  )
}
