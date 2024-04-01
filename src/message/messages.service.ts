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

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Message.name) private messageModel: SoftDeleteModel<MessageDocument>,
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
            return {
                _id: newMessage._id,
                createdAt: newMessage.createdAt
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
        const totalItems = (await this.messageModel.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.messageModel.find(filter)
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

    async getMessageByHr(
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
            const totalItems = await this.messageModel.countDocuments({
                ...filter,
                'company._id': userByHr?.company?._id,
            });

            // Tính toán tổng số trang dựa trên giới hạn mặc định
            const totalPages = Math.ceil(totalItems / defaultLimit);

            // Truy xuất CV nếu tìm thấy người dùng HR
            if (userByHr) {
                const result = await this.messageModel.find({
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
            const totalItems = (await this.messageModel.find(filter)).length;
            const totalPages = Math.ceil(totalItems / defaultLimit);

            const result = await this.messageModel.find(filter)
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
