import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PortalModule } from './modules/portal/portal.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // Config global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // JWT global
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),

    // Servir archivos estáticos
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),

    // Prisma global
    PrismaModule,

    // Módulos funcionales
    AuthModule,
    PortalModule,
    ProxyModule,
    PermissionsModule,
    InventoryModule,
    NotificationsModule,
  ],
})
export class AppModule { }
