import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MessagingService {
  constructor(@InjectQueue('inventory-events') private readonly queue: Queue) {}

  async publish(event: string, payload: unknown) {
    try {
      // Intentar publicar pero no bloquear si falla
      await Promise.race([
        this.queue.add('inventory', { event, payload }, { attempts: 3, timeout: 1000 }),
        new Promise((resolve) => setTimeout(resolve, 1000))
      ]);
    } catch (error) {
      // Log pero no fallar
      console.warn(`⚠️ No se pudo publicar evento ${event} a Redis (ignorado):`, error.message);
    }
  }
}
