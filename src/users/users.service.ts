import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  isValidPassword = (password: string, hash: string) => {
    return compareSync(password, hash); //false
  }

  checkUserEmail = (email: string) => {

  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { email, password, name, age, gender, address, phone, role, company } = createUserDto;
    const hashPassword = this.getHashPassword(password);
    const checkUserEmail = await this.userModel.findOne({ email })
    if (checkUserEmail) {
      throw new BadRequestException("Email đã tồn tại vui lòng sử dụng email khác để đăng ký!");
    }
    let newAUser = await this.userModel.create({
      email: createUserDto.email,
      password: hashPassword,
      name,
      age,
      gender,
      address,
      role,
      company,
      phone,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return newAUser;
  }

  async findAll(
    currentPage: number,
    limit: number,
    qs: string
  ) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter, "-password")
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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "user not found";

    return this.userModel.findOne({
      _id: id
    })
      .select("-password")
      .populate({ path: "role", select: { name: 1, _id: 1 } })
      ;
  }

  findOneByUserName(username: string) {
    return this.userModel.findOne({
      email: username
    }).populate({ path: "role", select: { name: 1, permissions: 1 } });
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne({ _id: updateUserDto._id }, {
      ...updateUserDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "user not found";

    const foundUser = await this.userModel.findById(id);
    if (foundUser.email === "admin@gmail.com") {
      throw new BadRequestException("Không thể xóa tài khoản email admin@gmail.com!");
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })

    return this.userModel.softDelete({
      _id: id
    });
  }


  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken }
    )
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken })
  }
}
