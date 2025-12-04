import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ReorderAlertsService } from './reorder-alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReorderAlertStatus } from '@prisma/client';

@Controller('inventory/reorder-alerts')
@UseGuards(JwtAuthGuard)
export class ReorderAlertsController {
    constructor(private readonly reorderAlertsService: ReorderAlertsService) { }

    @Get()
    async findAll(@Query('status') status?: ReorderAlertStatus) {
        return this.reorderAlertsService.findAll(status);
    }

    @Get('pending')
    async findPending() {
        return this.reorderAlertsService.findPending();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.reorderAlertsService.findOne(id);
    }

    @Post()
    async create(@Body() body: { productId: string }) {
        return this.reorderAlertsService.create(body.productId);
    }

    @Put(':id/resolve')
    async resolve(@Param('id') id: string) {
        return this.reorderAlertsService.resolve(id);
    }

    @Put(':id/ignore')
    async ignore(@Param('id') id: string, @Body() body: { notes?: string }) {
        return this.reorderAlertsService.ignore(id, body.notes);
    }
}
