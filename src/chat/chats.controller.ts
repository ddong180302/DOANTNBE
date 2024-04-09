import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';


@ApiTags('chats')
@Controller('chats')
export class ChatsController {
    constructor(
        private readonly chatsService: ChatsService
    ) { }

    @Post()
    @ResponseMessage("Create a new Chat")
    create(@Body() createChatDto: CreateChatDto, @User() user: IUser) {
        return this.chatsService.create(createChatDto, user);
    }


    @Public()
    @Get(':userId')
    @ResponseMessage("Fetch list Chats with paginate")
    findAllChatUserId(@Param('userId') userId: string,) {
        return this.chatsService.findAllChatUserId(userId);
    }

    @Get(':firstId/:secondId')
    @ResponseMessage("Fetch a chat by id")
    findOne(
        @Param('firstId') firstId: string,
        @Param('secondId') secondId: string
    ) {
        return this.chatsService.findOne(firstId, secondId);
    }

    @Patch(':id')
    @ResponseMessage("Update a Chat")
    update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto, @User() user: IUser) {
        return this.chatsService.update(id, updateChatDto, user);
    }

    @Delete(':id')
    @ResponseMessage("Delete a Chat")
    remove(@Param('id') id: string, @User() user: IUser) {
        return this.chatsService.remove(id, user);
    }
}
