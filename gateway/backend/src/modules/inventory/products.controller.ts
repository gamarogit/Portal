import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StockMovementType } from '@prisma/client';

@Controller('inventory/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: string) {
        return this.productsService.findAll(includeInactive === 'true');
    }

    @Get('search')
    async search(@Query('q') query: string) {
        return this.productsService.search(query);
    }

    @Get('low-stock')
    async getLowStock() {
        return this.productsService.getLowStock();
    }

    @Get('out-of-stock')
    async getOutOfStock() {
        return this.productsService.getOutOfStock();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Post()
    async create(
        @Body()
        body: {
            sku: string;
            name: string;
            description?: string;
            category?: string;
            unit?: string;
            currentStock?: number;
            minStock?: number;
            maxStock?: number;
            unitCost?: number;
            location?: string;
        },
    ) {
        return this.productsService.create(body);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body()
        body: {
            sku?: string;
            name?: string;
            description?: string;
            category?: string;
            unit?: string;
            minStock?: number;
            maxStock?: number;
            unitCost?: number;
            location?: string;
            active?: boolean;
        },
    ) {
        return this.productsService.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }

    @Post('movement')
    async registerMovement(
        @Request() req,
        @Body()
        body: {
            productId: string;
            type: StockMovementType;
            quantity: number;
            reason?: string;
            reference?: string;
            notes?: string;
        },
    ) {
        return this.productsService.registerMovement({
            ...body,
            userId: req.user.id,
        });
    }
}
