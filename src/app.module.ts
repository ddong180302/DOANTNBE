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

@Module({
  imports:
    [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
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
      SubscribersModule
    ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule { }
