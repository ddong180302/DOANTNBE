import { Injectable, Query } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose, { ObjectId } from 'mongoose';
import aqp from 'api-query-params';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';


@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>,
    private mailerService: MailerService,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>
  ) { }

  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    let company = await this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: company._id,
      createdAt: company.createdAt
    };
  }

  async contact(requestBody: any) {
    const { name, position, email, location, phone, nameCompany, websiteAddress } = requestBody;
    const adminRole = await this.roleModel.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      throw new Error('Không tìm thấy role ADMIN');
    }
    const userAdmin = await this.userModel.findOne(
      { role: adminRole._id },
      { email: 1, _id: 0 }
    );

    if (userAdmin) {
      const emailAdmin = userAdmin?.email;
      await this.mailerService.sendMail({
        to: emailAdmin,
        from: '"Nice App" <support@example.com>',
        subject: 'Welcome to Nice App! Confirm your Email',
        template: "contact",
        context: {
          email: email,
          name: name,
          position: position,
          location: location,
          phone: phone,
          nameCompany: nameCompany,
          websiteAddress: websiteAddress
        }
      });
    }

    await this.mailerService.sendMail({
      to: email,
      from: '"Nice App" <support@example.com>',
      subject: 'Welcome to Nice App! Confirm your Email',
      template: "feedback",
      context: {
        email: email, // Gửi đến địa chỉ email của người dùng mới
        name: name,
        position: position,
        location: location,
        phone: phone,
        nameCompany: nameCompany,
        websiteAddress: websiteAddress
      }
    });

    return userAdmin;
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
    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.companyModel.find(filter)
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "company not found";
    let company = await this.companyModel.findOne({
      _id: id
    })
    return company;
  }

  async countCompany() {
    const count = await this.companyModel.countDocuments({ isDeleted: false });
    return count;
  }


  async countCompanyWithDate(startDate: string, endDate: string) {
    const count = await this.companyModel.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    return count;
  }


  async findOneByUserId(user: IUser) {
    const { _id } = user;
    const userData = await this.userModel.findOne({ _id });
    let idCompany: ObjectId;
    if (userData) {
      idCompany = userData?.company?._id;
    }
    if (idCompany) {
      const companyData = await this.companyModel.findOne({ _id: idCompany })
      return companyData;
    }
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "company not found";
    let company = await this.companyModel.updateOne(
      { _id: id },
      {
        ...updateCompanyDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })

    return company;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "company not found";
    await this.companyModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.companyModel.softDelete({
      _id: id
    });
  }
}
