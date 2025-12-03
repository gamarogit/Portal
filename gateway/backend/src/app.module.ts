import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PortalModule } from './modules/portal/portal.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { InventoryModule } from './modules/inventory/inventory.module';

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

    // Prisma global
    PrismaModule,

    // Módulos funcionales
    AuthModule,
    PortalModule,
    ProxyModule,
    PermissionsModule,
    InventoryModule,
  ],
})
export class AppModule { }
