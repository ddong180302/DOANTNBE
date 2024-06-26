import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService
  ) { }

  @Post()
  @ResponseMessage("Create a new Job")
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage("Fetch list Jobs with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Post('count')
  @ResponseMessage("Count job!")
  countJob() {
    return this.jobsService.countJob();
  }

  @Public()
  @Post('countDate')
  @ResponseMessage("Count job by date!")
  countJobWithDate(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.jobsService.countJobWithDate(startDate, endDate);
  }

  @Post('count-by-hr')
  @ResponseMessage("Count job!")
  countJobByHr(@User() user: IUser) {
    return this.jobsService.countJobByHr(user);
  }

  @Post('countDate-by-hr')
  @ResponseMessage("Count job!")
  countJobByHrWithDate(
    @User() user: IUser,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.jobsService.countJobByHrWithDate(user, startDate, endDate);
  }

  @Get('by-hr')
  @ResponseMessage("Get all Job by hr!")
  getJobByHr(
    @User() user: IUser,
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.jobsService.getJobByHr(user, +currentPage, +limit, qs);
  }

  @Public()
  @Get('by-company-id/:id')
  @ResponseMessage("Get all job of company!")
  getAllJobByComId(@Param('id') id: string) {
    return this.jobsService.getAllJobByComId(id);
  }

  @Public()
  @Get(':id')
  @ResponseMessage("Fetch a job by id")
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update a Job")
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @User() user: IUser) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a Job")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }
}
