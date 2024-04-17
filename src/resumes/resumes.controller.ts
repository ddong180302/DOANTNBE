import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @Post()
  @ResponseMessage("Create a new resume!")
  create(@Body() createUserCvDto: CreateUserCvDto, @User() user: IUser) {
    return this.resumesService.create(createUserCvDto, user);
  }

  @Post('by-user')
  @ResponseMessage("Get Resume by user!")
  getResumeByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }


  @Public()
  @Post('count')
  @ResponseMessage("Count resume!")
  countResume() {
    return this.resumesService.countResume();
  }

  @Public()
  @Post('countDate')
  @ResponseMessage("Count resume by date!")
  countResumeWithDate(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.resumesService.countResumeWithDate(startDate, endDate);
  }

  @Post('count-by-hr')
  @ResponseMessage("Count resume!")
  countResumeByHr(@User() user: IUser) {
    return this.resumesService.countResumeByHr(user);
  }

  @Post('countDate-by-hr')
  @ResponseMessage("Count job!")
  countResumeByHrWithDate(
    @User() user: IUser,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.resumesService.countResumeByHrWithDate(user, startDate, endDate);
  }


  @Get('by-hr')
  @ResponseMessage("Get all Resume by hr!")
  getResumeByHr(
    @User() user: IUser,
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.resumesService.findByHr(user, +currentPage, +limit, qs);
  }

  @Get()
  @ResponseMessage("Fetch all resume with paginate!")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage("Fetch resume by id!")
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update status resume!")
  updateStatus(@Param('id') id: string, @Body("status") status: string, @User() user: IUser) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a resume by id!")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
