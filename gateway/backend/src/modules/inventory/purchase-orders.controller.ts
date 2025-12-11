import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseOrderStatus } from '@prisma/client';

@Controller('inventory/purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrdersController {
    constructor(
        private readonly purchaseOrdersService: PurchaseOrdersService,
    ) { }

    @Get()
    async findAll(
        @Query('status') status?: PurchaseOrderStatus,
        @Query('supplierId') supplierId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const filters: any = {};

        if (status) filters.status = status;
        if (supplierId) filters.supplierId = supplierId;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);

        return this.purchaseOrdersService.findAll(filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.purchaseOrdersService.findOne(id);
    }

    @Post()
    async create(
        @Body()
        body: {
            supplierId: string;
            expectedDate?: string;
            items: Array<{
                productId: string;
                quantity: number;
                unitCost: number;
            }>;
            notes?: string;
        },
    ) {
        return this.purchaseOrdersService.create({
            ...body,
            expectedDate: body.expectedDate
                ? new Date(body.expectedDate)
                : undefined,
        });
    }

    @Post('from-alert/:alertId')
    async createFromAlert(@Param('alertId') alertId: string) {
        return this.purchaseOrdersService.createFromAlert(alertId);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body()
        body: {
            expectedDate?: string;
            notes?: string;
            items?: Array<{
                id?: string;
                productId: string;
                quantity: number;
                unitCost: number;
            }>;
        },
    ) {
        return this.purchaseOrdersService.update(id, {
            ...body,
            expectedDate: body.expectedDate
                ? new Date(body.expectedDate)
                : undefined,
        });
    }

    @Put(':id/send')
    async markAsSent(@Param('id') id: string) {
        return this.purchaseOrdersService.markAsSent(id);
    }

    @Post(':id/receive')
    async receiveOrder(
        @Param('id') id: string,
        @Body()
        body: {
            items: Array<{
                itemId: string;
                receivedQty: number;
            }>;
        },
    ) {
        return this.purchaseOrdersService.receiveOrder(id, body.items);
    }

    @Delete(':id')
    async cancel(@Param('id') id: string) {
        return this.purchaseOrdersService.cancel(id);
    }
}
