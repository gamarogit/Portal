"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = exports.LogLevel = void 0;
const common_1 = require("@nestjs/common");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
let LoggerService = class LoggerService {
    setContext(context) {
        this.context = context;
    }
    log(message, context) {
        this.write(LogLevel.INFO, message, context);
    }
    error(message, trace, context) {
        this.write(LogLevel.ERROR, message, { ...context, trace });
    }
    warn(message, context) {
        this.write(LogLevel.WARN, message, context);
    }
    debug(message, context) {
        this.write(LogLevel.DEBUG, message, context);
    }
    write(level, message, context) {
        const log = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: this.context,
            ...context,
        };
        if (process.env.NODE_ENV === 'production') {
            console.log(JSON.stringify(log));
        }
        else {
            const emoji = this.getEmoji(level);
            console.log(`${emoji} [${log.timestamp}] [${level.toUpperCase()}] ${message}`, context || '');
        }
    }
    getEmoji(level) {
        switch (level) {
            case LogLevel.ERROR:
                return '❌';
            case LogLevel.WARN:
                return '⚠️';
            case LogLevel.INFO:
                return '✅';
            case LogLevel.DEBUG:
                return '🔍';
            default:
                return '📝';
        }
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)()
], LoggerService);
