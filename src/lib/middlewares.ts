import { ContextMessageUpdate } from 'telegraf'
import { fromLang } from './i18n'

const { ADMIN_CHAT_ID: ACI } = process.env
const ADMIN_CHAT_ID = +ACI!

import { MessageSubTypes } from 'telegraf/typings/telegram-types'
declare module 'telegraf' {
  export interface ContextMessageUpdate {
    updateSubTypes?: MessageSubTypes[]
  }
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
  ctx.reply(
    fromLang('uk')('start')!,
    { reply_to_message_id: ctx.message!.message_id }
  )
  if (ctx.chat!.type !== 'private') {
    ctx.reply(
      fromLang('uk')('only_private_chat_restriction')!,
      { reply_to_message_id: ctx.message!.message_id }
    )
  }
}

export async function all(ctx: ContextMessageUpdate) {
  if (ctx.chat!.id === ADMIN_CHAT_ID) {
    const forwarded = ctx.message!.reply_to_message
    if (!forwarded) return
    const updateTypes = ctx.updateSubTypes!
    if (updateTypes.includes('text')) {
      ctx.telegram.sendMessage(
        forwarded.forward_from!.id,
        ctx.message!.text!
      )
      return
    }
    if (updateTypes.includes('sticker')) {
      ctx.telegram.sendSticker(
        forwarded.forward_from!.id,
        ctx.message!.sticker!.file_id
      )
      return
    }
    if (updateTypes.includes('photo')) {
      ctx.message!.photo!.forEach(ph => {
        ctx.telegram.sendPhoto(
          forwarded.forward_from!.id,
          ph.file_id
        )
      })
      return
    }
    if (updateTypes.includes('voice')) {
      ctx.telegram.sendVoice(
        forwarded.forward_from!.id,
        ctx.message!.voice!.file_id
      )
      return
    }
    return
  }

  if (ctx.chat!.type === 'private') {
    ctx.telegram.sendMessage(
      ADMIN_CHAT_ID,
      `${'-'.repeat(40)}\nFrom: ${ctx.from!.username ? `@${ctx.from!.username}` : ctx.from!.first_name}`
    )
    ctx.telegram.forwardMessage(
      ADMIN_CHAT_ID,
      ctx.chat!.id,
      ctx.message!.message_id
    )
    ctx.reply(
      fromLang('uk')('message_accepted')!,
      { reply_to_message_id: ctx.message!.message_id }
    )
    return
  }
}
