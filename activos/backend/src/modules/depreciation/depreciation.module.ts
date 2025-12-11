import { Module } from '@nestjs/common';
import { DepreciationService } from './depreciation.service';
import { DepreciationController } from './depreciation.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [DepreciationService],
  controllers: [DepreciationController],
})
export class DepreciationModule {}
