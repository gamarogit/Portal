import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ReorderAlertsController } from './reorder-alerts.controller';
import { ReorderAlertsService } from './reorder-alerts.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, NotificationsModule],
    controllers: [
        ProductsController,
        ReorderAlertsController,
        PurchaseOrdersController,
    ],
    providers: [
        ProductsService,
        ReorderAlertsService,
        PurchaseOrdersService,
    ],
    exports: [
        ProductsService,
        ReorderAlertsService,
        PurchaseOrdersService,
    ],
})
export class InventoryModule { }
