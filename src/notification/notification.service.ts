import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto, ResetNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>) { }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ userId }).exec();
  }

  async createOrUpdateNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { userId, chatId, lastMessage } = createNotificationDto;
    return this.notificationModel.findOneAndUpdate(
      { userId, chatId },
      { $set: { lastMessage, updatedAt: new Date() }, $inc: { count: 1 } },
      { new: true, upsert: true }
    ).exec();
  }

  async resetNotification(resetNotificationDto: ResetNotificationDto): Promise<Notification> {
    const { userId, chatId } = resetNotificationDto;
    return this.notificationModel.findOneAndUpdate(
      { userId, chatId },
      { $set: { count: 0, updatedAt: new Date() } },
      { new: true }
    ).exec();
  }
}
