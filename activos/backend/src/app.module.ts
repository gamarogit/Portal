import { CacheModule } from '@nestjs/cache-manager';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis';
import { AssetModule } from './modules/asset/asset.module';
import { AuthModule } from './modules/auth/auth.module';
import { MovementModule } from './modules/movement/movement.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ReportModule } from './modules/reports/report.module';
import { MessagingModule } from './shared/messaging/messaging.module';
import { LoggerModule } from './shared/logger/logger.module';
import { RequestLoggerMiddleware } from './shared/middleware/request-logger.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { DepreciationModule } from './modules/depreciation/depreciation.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { DevModule } from './modules/dev/dev.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationModule } from './modules/notification/notification.module';
import { LicenseModule } from './modules/license/license.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AttachmentModule } from './modules/attachment/attachment.module';
import { HistoryModule } from './modules/history/history.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { QrModule } from './modules/qr/qr.module';
import { ReportBuilderModule } from './modules/report-builder/report-builder.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { SchemaMigrationModule } from './modules/schema-migration/schema-migration.module';

const devImports = process.env.ENABLE_DEV_ROUTES === '1' ? [DevModule] : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = Number(config.get('REDIS_PORT') ?? 6379);
        const ttl = Number(config.get('CACHE_TTL') ?? 300);
        return {
          store: redisStore,
          host: config.get('REDIS_HOST') || 'localhost',
          port,
          password: config.get('REDIS_PASSWORD'),
          ttl,
        };
      },
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: Number(config.get('REDIS_PORT') ?? 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),
    PrismaModule,
    LoggerModule,
    AssetModule,
    AuthModule,
    UserModule,
    RoleModule,
    MovementModule,
    MaintenanceModule,
    ReportModule,
    MessagingModule,
    AuditModule,
    DepreciationModule,
    IntegrationModule,
    MetricsModule,
    HealthModule,
    NotificationModule,
    LicenseModule,
    DashboardModule,
    AttachmentModule,
    HistoryModule,
    VendorModule,
    QrModule,
    ReportBuilderModule,
    ConfigurationModule,
    SchemaMigrationModule,
    ...devImports,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
