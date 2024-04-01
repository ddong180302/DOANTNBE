import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { CompaniesModule } from './companies/companies.module';
import { JobsModule } from './jobs/jobs.module';
import { FilesModule } from './files/files.module';
import { ResumesModule } from './resumes/resumes.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { DatabasesModule } from './databases/databases.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { SkillsModule } from './skills/skills.module';
import { ChatsModule } from './chat/chats.module';
import { MessagesModule } from './message/messages.module';
@Module({
  imports:
    [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      ThrottlerModule.forRoot([{
        ttl: 60000,
        limit: 10,
      }]),
      ScheduleModule.forRoot(),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('MONGODB_URI'),
          connectionFactory: (connection) => {
            connection.plugin(softDeletePlugin);
            return connection;
          }
        }),
        inject: [ConfigService],
      }),
      UsersModule,
      AuthModule,
      CompaniesModule,
      JobsModule,
      FilesModule,
      ResumesModule,
      PermissionsModule,
      RolesModule,
      DatabasesModule,
      SubscribersModule,
      MailModule,
      HealthModule,
      SkillsModule,
      ChatsModule,
      MessagesModule,

    ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule { }
