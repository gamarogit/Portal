import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  async getNotifications(@Request() req) {
    return this.notificationService.getActiveNotifications(req.user);
  }

  @Get('summary')
  async getSummary() {
    return this.notificationService.getNotificationsSummary();
  }
}
