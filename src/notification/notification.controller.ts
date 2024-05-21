import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { CreateNotificationDto, ResetNotificationDto } from './dto/create-notification.dto';
import { Public, ResponseMessage } from 'src/decorator/customize';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @ResponseMessage("Get notification")
  @Get(':userId')
  @Public()
  async getNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getNotifications(userId);
  }

  @Public()
  @ResponseMessage("Create Or Update Notification")
  @Post()
  async createOrUpdateNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createOrUpdateNotification(createNotificationDto);
  }

  @ResponseMessage("Reset notification")
  @Public()
  @Post('reset')
  async resetNotification(@Body() resetNotificationDto: ResetNotificationDto) {
    return this.notificationsService.resetNotification(resetNotificationDto);
  }
}



