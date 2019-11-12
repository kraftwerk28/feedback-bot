import { ContextMessageUpdate, Extra } from 'telegraf'
import { fromLang } from './i18n'
import {
  User,
  Message,
  ExtraEditMessage,
  ExtraPhoto,
  ExtraSticker,
  ExtraVoice
} from 'telegraf/typings/telegram-types'
import { log } from './bot'

const { ADMIN_CHAT_ID: ACI } = process.env
const ADMIN_CHAT_ID = +ACI!
const isDev = process.env.NODE_ENV === 'development'

const replyCache = new Map<number, { chatId: number; messageId: number }>()

declare module 'telegraf' {
  export interface Telegram {
    forwardMessage(
      chatId: number,
      fromChatId: number,
      messageId: number,
      extra?: Extra
    ): Promise<Message>
  }
}

const unameFromUser = (u: User): string => {
  if (u.username) return `@${u.username}`
  let fullName = u.first_name
  if (u.last_name) fullName += ` ${u.last_name}`
  return fullName
}

export async function start(ctx: ContextMessageUpdate): Promise<any> {
  ctx.reply(fromLang('uk')('start')!, {
    reply_to_message_id: ctx.message!.message_id
  })
  if (ctx.chat!.type !== 'private') {
    ctx.reply(fromLang('uk')('only_private_chat_restriction')!, {
      reply_to_message_id: ctx.message!.message_id
    })
  }
}

function catchMsgSend(reason: any): any {
  log(reason)
}

export async function onMessage(ctx: ContextMessageUpdate): Promise<any> {
  if (isDev) {
    log({
      chat_id: ctx.chat!.id,
      from: ctx.from!.id,
      message_id: ctx.message!.message_id
    })
  }
  if (ctx.chat!.id === ADMIN_CHAT_ID) {
    log('Admin reply')
    const reSent = ctx.message!.reply_to_message
    if (!reSent) return

    const remoteChat = replyCache.get(reSent.message_id)
    if (!remoteChat) return

    const updateTypes = ctx.updateSubTypes!

    const extra: ExtraEditMessage & ExtraPhoto & ExtraSticker & ExtraVoice = {
      reply_to_message_id: remoteChat.messageId
    }
    const chatId = remoteChat.chatId

    if (updateTypes.includes('text')) {
      await ctx.telegram
        .sendMessage(chatId, ctx.message!.text!, extra)
        .catch(catchMsgSend)
    }
    if (updateTypes.includes('sticker')) {
      await ctx.telegram
        .sendSticker(chatId, ctx.message!.sticker!.file_id, extra)
        .catch(catchMsgSend)
    }
    if (updateTypes.includes('photo')) {
      ctx.telegram
        .sendPhoto(chatId, ctx.message!.photo![0].file_id, extra)
        .catch(catchMsgSend)
    }
    if (updateTypes.includes('voice')) {
      await ctx.telegram.sendVoice(chatId, ctx.message!.voice!.file_id, extra)
    }
    return
  }

  if (ctx.chat!.type === 'private') {
    const remoteChat = {
      chatId: ctx.chat!.id,
      messageId: ctx.message!.message_id
    }

    // if message contains only text
    const shouldntForward =
      ctx.updateSubTypes.length === 1 && ctx.updateSubTypes[0] === 'text'

    // prelude text
    const fromText =
      `From: ${unameFromUser(ctx.from!)} [${ctx.from!.id}]\n` +
      `${'-'.repeat(40)}\n` +
      (shouldntForward ? ctx.message!.text : '')

    await ctx.telegram.sendMessage(ADMIN_CHAT_ID, fromText).then(msg => {
      replyCache.set(msg.message_id, remoteChat)
      if (shouldntForward) return

      // if not only text then forward
      ctx.telegram
        .forwardMessage(ADMIN_CHAT_ID, ctx.chat!.id, ctx.message!.message_id)
        .then(fwmsg => {
          replyCache.set(fwmsg.message_id, remoteChat)
        })
    })

    return
  }
}

export async function onEditMessage(ctx: ContextMessageUpdate): Promise<any> {
  // if (ctx.chat!.id === ADMIN_CHAT_ID) {
  //   // if I have been edited message
  //   const remoteChat = replyCache.get(ctx.editedMessage!.message_id)
  //   if (!remoteChat) return

  //   ctx.telegram.editMessageText(
  //     remoteChat.chatId,
  //     remoteChat.messageId,
  //     undefined,
  //     ctx.editedMessage!.text!
  //   )
  //   return
  // }

  if (ctx.chat!.type === 'private') {
    await ctx.reply(fromLang('uk')('edit_support')!, {
      reply_to_message_id: ctx.editedMessage!.message_id
    })
  }
}
