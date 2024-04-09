import { BadRequestException, Injectable } from '@nestjs/common';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatsService {
    constructor(
        @InjectModel(Chat.name) private chatModel: SoftDeleteModel<ChatDocument>,
        @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    ) { }
    async create(createChatDto: CreateChatDto, user: IUser) {
        const { firstId, secondId } = createChatDto;
        try {
            if (firstId === secondId) {
                const dataAllChat = await this.chatModel.find({ $or: [{ firstId: firstId }, { secondId: firstId }] });
                return dataAllChat;
            } else {

                if (firstId && secondId) {
                    const chat = await this.chatModel.findOne({
                        $or: [
                            { firstId: firstId, secondId: secondId },
                            { firstId: secondId, secondId: firstId }
                        ]
                    });
                    if (chat) {
                        const dataAllChat = await this.chatModel.find({ $or: [{ firstId: firstId }, { secondId: firstId }] });
                        return dataAllChat;
                    } else {
                        const firstUser = await this.userModel.findOne({ _id: firstId });
                        const secondUser = await this.userModel.findOne({ _id: secondId });
                        if (firstUser && secondUser) {
                            const newChat = await this.chatModel.create({
                                firstId: firstId,
                                secondId: secondId,
                                firstName: firstUser.name, // Lưu trường name của firstUser vào firstName
                                secondName: secondUser.name, // Lưu trường name của secondUser vào secondName
                                firstEmail: firstUser.email, // Lưu trường email của firstUser vào firstEmail
                                secondEmail: secondUser.email, // Lưu trường email của secondUser vào secondEmail
                                createdBy: {
                                    _id: user._id,
                                    email: user.email
                                }
                            });

                            if (newChat) {
                                const dataAllChat = await this.chatModel.find({ $or: [{ firstId: firstId }, { secondId: firstId }] });
                                return dataAllChat;
                            }
                        } else {
                            throw new BadRequestException("Lỗi");
                        }
                    }
                }
            }
        } catch (error) {
            console.log('bị lỗi rồi: ', error);
        }
    }

    async findAllChatUserId(userId: string) {
        const dataAllChat = await this.chatModel.find({ $or: [{ firstId: userId }, { secondId: userId }] });
        return dataAllChat;
    }

    async findOne(firstId: string, secondId: string) {
        if (!mongoose.Types.ObjectId.isValid(firstId) && !mongoose.Types.ObjectId.isValid(secondId))
            return "chat not found";
        let chat = await this.chatModel.findOne({
            $or: [
                { firstId: firstId, secondId: secondId },
                { firstId: secondId, secondId: firstId }
            ]
        })
        return chat;
    }

    async update(id: string, updateChatDto: UpdateChatDto, user: IUser) {
        if (!mongoose.Types.ObjectId.isValid(id))
            return "chat not found";
        let updatedChat = await this.chatModel.updateOne(
            {
                _id: id
            },
            {
                ...updateChatDto,
                updatedBy: {
                    _id: user._id,
                    email: user.email
                }
            })
        return updatedChat;
    }

    async remove(id: string, user: IUser) {
        if (!mongoose.Types.ObjectId.isValid(id))
            return "chat not found";
        await this.chatModel.updateOne(
            { _id: id },
            {
                deletedBy: {
                    _id: user._id,
                    email: user.email
                }
            })
        return this.chatModel.softDelete({
            _id: id
        });
    }
}
