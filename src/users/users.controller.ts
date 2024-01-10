import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './users.interface';
import { Public, ResponseMessage, User } from 'src/decorator/customize';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage("Create a new user!")
  create(
    @Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @ResponseMessage("Fetch List Users with paginate!")
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qs: string
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage("Fetch user by id!")
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @ResponseMessage("Update a user!")
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a User!")
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.usersService.remove(id, user);
  }
}
