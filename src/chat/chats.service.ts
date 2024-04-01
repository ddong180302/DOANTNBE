import { Injectable } from '@nestjs/common';
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
            const chat = await this.chatModel.findOne({ firstId, secondId })
            if (chat) return chat;

            const newChat = await this.chatModel.create({
                ...createChatDto,
                createdBy: {
                    _id: user._id,
                    email: user.email
                }
            })
            return {
                _id: newChat._id,
                createdAt: newChat.createdAt
            };
        } catch (error) {
            console.log(error);
        }


    }

    async findAll(
        currentPage: number,
        limit: number,
        qs: string
    ) {
        const { filter, sort, population } = aqp(qs);
        delete filter.current;
        delete filter.pageSize;
        let offset = (currentPage - 1) * (+limit);
        let defaultLimit = +limit ? +limit : 10;
        const totalItems = (await this.chatModel.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.chatModel.find(filter)
            .skip(offset)
            .limit(defaultLimit)
            // @ts-ignore: Unreachable code error
            .sort(sort as any)
            .populate(population)
            .exec();

        return {
            meta: {
                current: currentPage, //trang hiện tại
                pageSize: limit, //số lượng bản ghi đã lấy
                pages: totalPages, //tổng số trang với điều kiện query
                total: totalItems // tổng số phần tử (số bản ghi)
            },
            result //kết quả query
        }

    }

    async getChatByHr(
        user: IUser,
        currentPage: number,
        limit: number,
        qs: string
    ) {
        if (user?.role?.name === "HR") {
            // Lấy ID người dùng và chi tiết người dùng HR
            const { _id } = user;
            const userByHr = await this.userModel.findById(_id).populate("company");

            // Phân tích chuỗi truy vấn
            const { filter, sort, population, projection } = aqp(qs);

            // Loại bỏ các tham số phân trang khỏi bộ lọc
            delete filter.current;
            delete filter.pageSize;

            // Tính toán bù đắp phân trang và giới hạn mặc định
            const offset = (currentPage - 1) * limit;
            const defaultLimit = limit ? limit : 10;

            // Đếm tổng số mục phù hợp với bộ lọc
            const totalItems = await this.chatModel.countDocuments({
                ...filter,
                'company._id': userByHr?.company?._id,
            });

            // Tính toán tổng số trang dựa trên giới hạn mặc định
            const totalPages = Math.ceil(totalItems / defaultLimit);

            // Truy xuất CV nếu tìm thấy người dùng HR
            if (userByHr) {
                const result = await this.chatModel.find({
                    ...filter,
                    'company._id': userByHr?.company?._id,
                })
                    .skip(offset)
                    .limit(defaultLimit)
                    .sort(sort as any)
                    .populate(population)
                    .select(projection)
                    .exec();

                return {
                    meta: {
                        current: currentPage,
                        pageSize: limit,
                        pages: totalPages,
                        total: totalItems
                    },
                    result
                };
            } else {
                // Xử lý trường hợp không tìm thấy người dùng HR
                return {
                    meta: {
                        current: currentPage,
                        pageSize: limit,
                        pages: 0, // Cho biết không có dữ liệu
                        total: 0
                    },
                    result: [] // Gửi mảng rỗng
                };
            }

        } else if (user?.role?.name !== "HR") {
            const { filter, sort, population, projection } = aqp(qs);
            delete filter.current;
            delete filter.pageSize;
            let offset = (currentPage - 1) * (+limit);
            let defaultLimit = +limit ? +limit : 10;
            const totalItems = (await this.chatModel.find(filter)).length;
            const totalPages = Math.ceil(totalItems / defaultLimit);

            const result = await this.chatModel.find(filter)
                .skip(offset)
                .limit(defaultLimit)
                // @ts-ignore: Unreachable code error
                .sort(sort as any)
                .populate(population)
                .select(projection as any)
                .exec();

            return {
                meta: {
                    current: currentPage, //trang hiện tại
                    pageSize: limit, //số lượng bản ghi đã lấy
                    pages: totalPages, //tổng số trang với điều kiện query
                    total: totalItems // tổng số phần tử (số bản ghi)
                },
                result //kết quả query
            }
        }

    }


    async findOne(firstId: string, secondId: string) {
        if (!mongoose.Types.ObjectId.isValid(firstId) && !mongoose.Types.ObjectId.isValid(secondId))
            return "chat not found";
        let chat = await this.chatModel.findOne({
            firstId: firstId, secondId: secondId
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
