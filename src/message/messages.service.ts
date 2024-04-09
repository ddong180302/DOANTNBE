import { Injectable } from '@nestjs/common';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message, MessageDocument } from './schemas/message.schema';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Chat, ChatDocument } from 'src/chat/schemas/chat.schema';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Message.name) private messageModel: SoftDeleteModel<MessageDocument>,
        @InjectModel(Chat.name) private chatModel: SoftDeleteModel<ChatDocument>,
        @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    ) { }
    async create(createMessageDto: CreateMessageDto, user: IUser) {
        try {
            const newMessage = await this.messageModel.create({
                ...createMessageDto,
                createdBy: {
                    _id: user._id,
                    email: user.email
                }
            })
            return newMessage;
        } catch (error) {
            console.log(error);
        }
    }


    async findAllMessage(firstId: string, secondId: string) {
        if (!mongoose.Types.ObjectId.isValid(firstId) && !mongoose.Types.ObjectId.isValid(secondId))
            return "chat not found";
        let chat = await this.chatModel.findOne({
            $or: [
                { firstId: firstId, secondId: secondId },
                { firstId: secondId, secondId: firstId }
            ]
        })

        if (chat) {
            const chatId = chat._id;
            let message = await this.messageModel.find({
                chatId: chatId
            })
            return message;

        }
    }

    async findOne(chatId: string) {
        if (!mongoose.Types.ObjectId.isValid(chatId))
            return "message not found";
        let message = await this.messageModel.find({
            chatId: chatId
        })
        return message;
    }

    async update(id: string, updateMessageDto: UpdateMessageDto, user: IUser) {
        if (!mongoose.Types.ObjectId.isValid(id))
            return "message not found";
        let updatedMessage = await this.messageModel.updateOne(
            {
                _id: id
            },
            {
                ...updateMessageDto,
                updatedBy: {
                    _id: user._id,
                    email: user.email
                }
            })
        return updatedMessage;
    }

    async remove(id: string, user: IUser) {
        if (!mongoose.Types.ObjectId.isValid(id))
            return "message not found";
        await this.messageModel.updateOne(
            { _id: id },
            {
                deletedBy: {
                    _id: user._id,
                    email: user.email
                }
            })
        return this.messageModel.softDelete({
            _id: id
        });
    }
}
