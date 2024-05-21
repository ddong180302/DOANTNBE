import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsMongoId()
    userId: string;

    @IsNotEmpty()
    @IsMongoId()
    chatId: string;

    @IsNotEmpty()
    @IsString()
    lastMessage: string;
}

export class ResetNotificationDto {
    @IsNotEmpty()
    @IsMongoId()
    userId: string;

    @IsNotEmpty()
    @IsMongoId()
    chatId: string;
}
