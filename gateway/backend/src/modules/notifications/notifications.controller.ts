import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationType, NotificationPriority } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async findAll(@Request() req) {
        const userId = req.user.id;
        const role = req.user.role?.name || 'USER';
        return this.notificationsService.findAll(userId, role);
    }

    @Put(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.notificationsService.delete(id);
    }

    // Endpoint for testing purposes
    @Post('test')
    async createTest(@Body() body: any, @Request() req) {
        return this.notificationsService.create({
            userId: req.user.id,
            type: NotificationType.INFO,
            title: body.title || 'Notificación de Prueba',
            message: body.message || 'Esta es una notificación generada manualmente.',
            priority: NotificationPriority.MEDIUM,
            link: '/systems',
        });
    }
}
