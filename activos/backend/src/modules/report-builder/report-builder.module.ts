import { Module } from '@nestjs/common';
import { ReportBuilderService } from './report-builder.service';
import { ReportBuilderController } from './report-builder.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportBuilderController],
  providers: [ReportBuilderService],
})
export class ReportBuilderModule {}
