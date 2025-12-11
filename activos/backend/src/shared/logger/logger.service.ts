import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogContext {
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: LogContext) {
    this.write(LogLevel.INFO, message, context);
  }

  error(message: string, trace?: string, context?: LogContext) {
    this.write(LogLevel.ERROR, message, { ...context, trace });
  }

  warn(message: string, context?: LogContext) {
    this.write(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: LogContext) {
    this.write(LogLevel.DEBUG, message, context);
  }

  private write(level: LogLevel, message: string, context?: LogContext) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      ...context,
    };

    // En producción, esto debería ir a un sistema de logs centralizado
    // Por ahora, JSON estructurado a stdout
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(log));
    } else {
      const emoji = this.getEmoji(level);
      console.log(`${emoji} [${log.timestamp}] [${level.toUpperCase()}] ${message}`, context || '');
    }
  }

  private getEmoji(level: LogLevel): string {
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
}
