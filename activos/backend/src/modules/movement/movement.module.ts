import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagingModule } from 'src/shared/messaging/messaging.module';
import { AuditModule } from 'src/modules/audit/audit.module';
import { MovementController } from './movement.controller';
import { MovementService } from './movement.service';

@Module({
  imports: [PrismaModule, MessagingModule, AuditModule],
  controllers: [MovementController],
  providers: [MovementService],
})
export class MovementModule {}
