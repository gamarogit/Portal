import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MessagingService } from './messaging.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'inventory-events',
    }),
  ],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
