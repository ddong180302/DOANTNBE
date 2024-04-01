import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';


@ApiTags('messages')
@Controller('messages')
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService
    ) { }

    @Post()
    @ResponseMessage("Create a new Message")
    create(@Body() createMessageDto: CreateMessageDto, @User() user: IUser) {
        return this.messagesService.create(createMessageDto, user);
    }

    @Public()
    @Get()
    @ResponseMessage("Fetch list Messages with paginate")
    findAll(
        @Query("current") currentPage: string,
        @Query("pageSize") limit: string,
        @Query() qs: string
    ) {
        return this.messagesService.findAll(+currentPage, +limit, qs);
    }

    @Get('by-hr')
    @ResponseMessage("Get all Resume by hr!")
    getMessageByHr(
        @User() user: IUser,
        @Query("current") currentPage: string,
        @Query("pageSize") limit: string,
        @Query() qs: string
    ) {
        return this.messagesService.getMessageByHr(user, +currentPage, +limit, qs);
    }

    @Get(':chatId')
    @ResponseMessage("Fetch a message by id")
    findOne(
        @Param('chatId') chatId: string,
    ) {
        return this.messagesService.findOne(chatId);
    }

    @Patch(':id')
    @ResponseMessage("Update a Message")
    update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto, @User() user: IUser) {
        return this.messagesService.update(id, updateMessageDto, user);
    }

    @Delete(':id')
    @ResponseMessage("Delete a Message")
    remove(@Param('id') id: string, @User() user: IUser) {
        return this.messagesService.remove(id, user);
    }
}
