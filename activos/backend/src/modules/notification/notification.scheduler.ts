import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationScheduler implements OnModuleInit, OnModuleDestroy {
  private interval?: NodeJS.Timeout;
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async onModuleInit() {
    // Ejecutar cada hora
    this.interval = setInterval(() => this.runCheck(), 60 * 60 * 1000);
    // Ejecutar inmediatamente al iniciar
    await this.runCheck();
  }

  async onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async runCheck() {
    try {
      await this.notificationService.checkAndNotify();
    } catch (error) {
      this.logger.error('Error en verificación de notificaciones', error);
    }
  }
}
