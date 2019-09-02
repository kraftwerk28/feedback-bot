"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var telegraf_1 = __importDefault(require("telegraf"));
var middlewares_1 = require("./middlewares");
var _a = process.env, BOT_TOKEN = _a.BOT_TOKEN, BOT_USERNAME = _a.BOT_USERNAME, NODE_ENV = _a.NODE_ENV, ADMIN_CHAT_ID = _a.ADMIN_CHAT_ID;
var bot = new telegraf_1.default(BOT_TOKEN, {
    username: BOT_USERNAME,
    telegram: {
        webhookReply: true
    }
});
bot.start(middlewares_1.start);
bot.on('message', middlewares_1.all);
bot.startPolling();
// bot.startWebhook()
