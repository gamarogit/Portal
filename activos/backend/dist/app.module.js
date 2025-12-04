"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const cache_manager_ioredis_1 = require("cache-manager-ioredis");
const asset_module_1 = require("./modules/asset/asset.module");
const auth_module_1 = require("./modules/auth/auth.module");
const movement_module_1 = require("./modules/movement/movement.module");
const maintenance_module_1 = require("./modules/maintenance/maintenance.module");
const report_module_1 = require("./modules/reports/report.module");
const messaging_module_1 = require("./shared/messaging/messaging.module");
const logger_module_1 = require("./shared/logger/logger.module");
const request_logger_middleware_1 = require("./shared/middleware/request-logger.middleware");
const prisma_module_1 = require("./prisma/prisma.module");
const audit_module_1 = require("./modules/audit/audit.module");
const depreciation_module_1 = require("./modules/depreciation/depreciation.module");
const integration_module_1 = require("./modules/integration/integration.module");
const metrics_module_1 = require("./modules/metrics/metrics.module");
const user_module_1 = require("./modules/user/user.module");
const role_module_1 = require("./modules/role/role.module");
const dev_module_1 = require("./modules/dev/dev.module");
const health_module_1 = require("./modules/health/health.module");
const notification_module_1 = require("./modules/notification/notification.module");
const license_module_1 = require("./modules/license/license.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const attachment_module_1 = require("./modules/attachment/attachment.module");
const history_module_1 = require("./modules/history/history.module");
const vendor_module_1 = require("./modules/vendor/vendor.module");
const qr_module_1 = require("./modules/qr/qr.module");
const devImports = process.env.ENABLE_DEV_ROUTES === '1' ? [dev_module_1.DevModule] : [];
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_logger_middleware_1.RequestLoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const port = Number(config.get('REDIS_PORT') ?? 6379);
                    const ttl = Number(config.get('CACHE_TTL') ?? 300);
                    return {
                        store: cache_manager_ioredis_1.redisStore,
                        host: config.get('REDIS_HOST') || 'localhost',
                        port,
                        password: config.get('REDIS_PASSWORD'),
                        ttl,
                    };
                },
                isGlobal: true,
            }),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    redis: {
                        host: config.get('REDIS_HOST') || 'localhost',
                        port: Number(config.get('REDIS_PORT') ?? 6379),
                        password: config.get('REDIS_PASSWORD'),
                    },
                }),
            }),
            prisma_module_1.PrismaModule,
            logger_module_1.LoggerModule,
            asset_module_1.AssetModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            role_module_1.RoleModule,
            movement_module_1.MovementModule,
            maintenance_module_1.MaintenanceModule,
            report_module_1.ReportModule,
            messaging_module_1.MessagingModule,
            audit_module_1.AuditModule,
            depreciation_module_1.DepreciationModule,
            integration_module_1.IntegrationModule,
            metrics_module_1.MetricsModule,
            health_module_1.HealthModule,
            notification_module_1.NotificationModule,
            license_module_1.LicenseModule,
            dashboard_module_1.DashboardModule,
            attachment_module_1.AttachmentModule,
            history_module_1.HistoryModule,
            vendor_module_1.VendorModule,
            qr_module_1.QrModule,
            ...devImports,
        ],
    })
], AppModule);
