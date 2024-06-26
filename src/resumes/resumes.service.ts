import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose, { ObjectId } from 'mongoose';
import aqp from 'api-query-params';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class ResumesService {

  constructor(
    @InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) { }

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { url, companyId, jobId } = createUserCvDto;
    const { _id, email } = user;

    const newCV = await this.resumeModel.create({
      url,
      companyId,
      userId: _id,
      jobId,
      email,
      status: "PENDING",
      createdBy: { _id, email },
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ]
    })

    return {
      _id: newCV?._id,
      createdAt: newCV?.createdAt
    }
  }

  async findAll(
    currentPage: number,
    limit: number,
    qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
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

  async findByUsers(user: IUser) {
    const { _id } = user;
    return await this.resumeModel.find({
      userId: _id
    })
      .sort("-createdAt")
      .populate([
        {
          path: "companyId",
          select: { name: 1 }
        },
        {
          path: "jobId",
          select: { name: 1 }
        }
      ])

  }

  async findByHr(
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
      const totalItems = await this.resumeModel.countDocuments({
        ...filter,
        companyId: userByHr?.company?._id,
      });

      // Tính toán tổng số trang dựa trên giới hạn mặc định
      const totalPages = Math.ceil(totalItems / defaultLimit);

      // Truy xuất CV nếu tìm thấy người dùng HR
      if (userByHr) {
        const result = await this.resumeModel.find({
          ...filter,
          companyId: userByHr?.company?._id,
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
      const totalItems = (await this.resumeModel.find(filter)).length;
      const totalPages = Math.ceil(totalItems / defaultLimit);

      const result = await this.resumeModel.find(filter)
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

  async findOne(_id: string) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("Not found resume")
    }
    return await this.resumeModel.findById({
      _id
    })
  }

  async countResume() {
    const count = await this.resumeModel.countDocuments();
    return count;
  }


  async countResumeWithDate(startDate: string, endDate: string) {
    const count = await this.resumeModel.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    return count;
  }

  async countResumeByHr(user: IUser,) {
    const { _id } = user;
    const userData = await this.userModel.findOne({ _id });
    let idCompany: ObjectId;
    if (userData) {
      idCompany = userData?.company?._id;
    }
    if (idCompany) {
      const count = await this.resumeModel.countDocuments({ companyId: idCompany, isDeleted: false });
      return count;
    }
  }

  async countResumeByHrWithDate(user: IUser, startDate: string, endDate: string) {
    const { _id } = user;
    const userData = await this.userModel.findOne({ _id });
    let idCompany: ObjectId;
    if (userData) {
      idCompany = userData?.company?._id;
    }
    if (idCompany) {
      const count = await this.resumeModel.countDocuments({
        companyId: idCompany,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
      return count;
    }
  }

  async update(_id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("Not found resume")
    }

    const updated = await this.resumeModel.updateOne(
      { _id },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email
        },
        $push: {
          history: {
            status: status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        }
      }
    )
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Not found resume")
    }
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.resumeModel.softDelete({
      _id: id
    });
  }
}
