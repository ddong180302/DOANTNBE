import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    return this.companiesService.create(createCompanyDto, user);
  }

  @Post('contact')
  @Public()
  @ResponseMessage("impormation contact!")
  contact(@Body() requestBody: any) {
    return this.companiesService.contact(requestBody);
  }


  @Public()
  @Get()
  @ResponseMessage("Fetch List Companies with paginate!")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.companiesService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Post('count')
  @ResponseMessage("Count company!")
  countCompany() {
    return this.companiesService.countCompany();
  }

  @Public()
  @Post('countDate')
  @ResponseMessage("Count company by date!")
  countCompanyWithDate(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.companiesService.countCompanyWithDate(startDate, endDate);
  }


  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Post('by-user')
  @ResponseMessage("Get Company by user!")
  findOneByUserId(@User() user: IUser) {
    return this.companiesService.findOneByUserId(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser
  ) {
    return this.companiesService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.companiesService.remove(id, user);
  }
}
