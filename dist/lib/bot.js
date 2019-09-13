"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var telegraf_1 = __importDefault(require("telegraf"));
var middlewares_1 = require("./middlewares");
var _a = process.env, NODE_ENV = _a.NODE_ENV, BOT_TOKEN = _a.BOT_TOKEN, BOT_USERNAME = _a.BOT_USERNAME, BOT_WEBHOOK_PATH = _a.BOT_WEBHOOK_PATH, BOT_WEBHOOK_PORT = _a.BOT_WEBHOOK_PORT, BOT_WEBHOOK_HOST = _a.BOT_WEBHOOK_HOST, PORT = _a.PORT;
var bot = new telegraf_1.default(BOT_TOKEN, {
    username: BOT_USERNAME,
    telegram: {
        webhookReply: true
    }
});
bot.start(middlewares_1.start);
bot.on('message', middlewares_1.all);
var server;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var lastUpdateID, getUpdateRec, whURL;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bot.stop().telegram.deleteWebhook()];
                case 1:
                    _a.sent();
                    lastUpdateID = 0;
                    getUpdateRec = function () { return __awaiter(_this, void 0, void 0, function () {
                        var newUpdate;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, bot.telegram.getUpdates(undefined, 100, lastUpdateID + 1)];
                                case 1:
                                    newUpdate = _a.sent();
                                    if (!(newUpdate.length > 0)) return [3 /*break*/, 3];
                                    // eslint-disable-next-line require-atomic-updates
                                    lastUpdateID = newUpdate[newUpdate.length - 1].update_id;
                                    console.log("Fetched old updates: " + lastUpdateID);
                                    return [4 /*yield*/, getUpdateRec()];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, getUpdateRec()];
                case 2:
                    _a.sent();
                    if (NODE_ENV === 'development') {
                        bot.startPolling();
                    }
                    else if (NODE_ENV === 'production') {
                        whURL = "https://" + BOT_WEBHOOK_HOST + ":" + BOT_WEBHOOK_PORT + BOT_WEBHOOK_PATH;
                        console.log("Webhook set onto " + whURL);
                        bot.telegram.setWebhook(whURL);
                        server = http_1.default.createServer(bot.webhookCallback(BOT_WEBHOOK_PATH));
                        server.listen(PORT, function () { return console.log("Server listening on :" + PORT); });
                    }
                    console.log("Bot works in " + NODE_ENV + " mode...");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(interrupt);
function interrupt() {
    bot.stop();
    if (server)
        server.close(function () {
            process.exit(0);
        });
}
process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);
process.on('unhandledRejection', interrupt);
