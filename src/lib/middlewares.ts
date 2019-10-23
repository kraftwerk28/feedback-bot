import { ContextMessageUpdate } from 'telegraf'
import { fromLang } from './i18n'
import { MessageSubTypes, User, Message } from 'telegraf/typings/telegram-types'

const { ADMIN_CHAT_ID: ACI } = process.env
const ADMIN_CHAT_ID = +ACI!

declare module 'telegraf' {
  export interface ContextMessageUpdate {
    updateSubTypes?: MessageSubTypes[];
  }
  export interface Telegram {
    forwardMessage(
      chatId: number,
      fromChatId: number,
      messageId: number,
      extra?: Extra
    ): Promise<Message>;
  }
}

const unameFromUser = (u: User): string => {
  if (u.username) return `@${u.username}`
  let fullName = u.first_name
  if (u.last_name) fullName += ` ${u.last_name}`
  return fullName
}

export async function start(ctx: ContextMessageUpdate): Promise<any> {
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

export async function onMessage(ctx: ContextMessageUpdate): Promise<any> {
  if (ctx.chat!.id === ADMIN_CHAT_ID) {
    const forwarded = ctx.message!.reply_to_message
    if (!forwarded || !forwarded!.forward_from) return
    const updateTypes = ctx.updateSubTypes!
    if (updateTypes.includes('text')) {
      await ctx.telegram.sendMessage(
        forwarded.forward_from!.id,
        ctx.message!.text!
      )
      return
    }
    if (updateTypes.includes('sticker')) {
      await ctx.telegram.sendSticker(
        forwarded.forward_from!.id,
        ctx.message!.sticker!.file_id
      )
      return
    }
    if (updateTypes.includes('photo')) {
      await ctx.message!.photo!.forEach(ph => {
        ctx.telegram.sendPhoto(
          forwarded.forward_from!.id,
          ph.file_id
        )
      })
      return
    }
    if (updateTypes.includes('voice')) {
      await ctx.telegram.sendVoice(
        forwarded.forward_from!.id,
        ctx.message!.voice!.file_id
      )
      return
    }
    return
  }

  if (ctx.chat!.type === 'private') {
    if (
      ctx.updateSubTypes &&
      ctx.updateSubTypes.length === 1
      && ctx.updateSubTypes.includes('text')
    ) {
      // if message contains only text
      const msg = `${'-'.repeat(40)}\n` +
        `From: ${unameFromUser(ctx.from!)} [${ctx.from!.id}]\n\n` +
        ctx.message!.text
      await ctx.telegram.sendMessage(
        ADMIN_CHAT_ID,
        msg
      )
    } else {
      // else => forward
      await ctx.telegram.sendMessage(
        ADMIN_CHAT_ID,
        `${'-'.repeat(40)}\nFrom: ${unameFromUser(ctx.from!)} [${ctx.from!.id}]`
      ).then(() => {
        ctx.telegram.forwardMessage(
          ADMIN_CHAT_ID,
          ctx.chat!.id,
          ctx.message!.message_id
        ).then(() => {
          // ctx.reply(
          //   fromLang('uk')('message_accepted')!,
          //   { reply_to_message_id: ctx.message!.message_id }
          // )
        })
      })
    }
    return
  }
}

export async function onEditMessage(ctx: ContextMessageUpdate): Promise<any> {
  await ctx.reply(
    fromLang('uk')('edit_support')!,
    { reply_to_message_id: ctx.editedMessage!.message_id }
  )
}
