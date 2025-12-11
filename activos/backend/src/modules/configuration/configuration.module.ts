import { Module } from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { SchemaMigrationModule } from '../schema-migration/schema-migration.module';

@Module({
  imports: [SchemaMigrationModule],
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}
