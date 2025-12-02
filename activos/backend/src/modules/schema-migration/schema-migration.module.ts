import { Module } from '@nestjs/common';
import { SchemaMigrationController } from './schema-migration.controller';
import { SchemaMigrationService } from './schema-migration.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchemaMigrationController],
  providers: [SchemaMigrationService],
  exports: [SchemaMigrationService],
})
export class SchemaMigrationModule {}
