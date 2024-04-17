import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserHrDto } from './dto/create-user.dto';
import { UpdateInforUserDto, UpdateUserDto, UpdateUserHrDto } from './dto/update-user.dto';
import { IUser } from './users.interface';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage("Create a new user!")
  create(
    @Body() createUserDto: CreateUserDto, @User() user: IUser
  ) {
    return this.usersService.create(createUserDto, user);
  }

  @Post("/hr")
  @ResponseMessage("Create a new user!")
  createUserHr(
    @Body() createUserHrDto: CreateUserHrDto, @User() user: IUser
  ) {
    return this.usersService.createUserHr(createUserHrDto, user);
  }

  @Get()
  @ResponseMessage("Fetch List Users with paginate!")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
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

  @Public()
  @Get('userId/:id')
  @ResponseMessage("Fetch id user by id!")
  findIdUser(@Param('id') id: string) {
    return this.usersService.findIdUser(id);
  }

  @Public()
  @Post('count')
  @ResponseMessage("count user!")
  countUser() {
    return this.usersService.countUser();
  }



  @Public()
  @Post('countDate')
  @ResponseMessage("Count user by date!")
  countUserWithDate(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.usersService.countUserWithDate(startDate, endDate);
  }



  @Post('by-user')
  @ResponseMessage("Fetch user by user!")
  findByUser(@User() user: IUser) {
    return this.usersService.findByUser(user);
  }

  @Patch()
  @ResponseMessage("Update a user!")
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Patch("by-user")
  @ResponseMessage("Update a user!")
  updateInforByUser(@Body() updateInforUserDto: UpdateInforUserDto, @User() user: IUser) {
    return this.usersService.updateInforByUser(updateInforUserDto, user);
  }

  @Patch("/hr")
  @ResponseMessage("Update a user!")
  updateHr(@Body() updateUserHrDto: UpdateUserHrDto, @User() user: IUser) {
    return this.usersService.updateHr(updateUserHrDto, user);
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
