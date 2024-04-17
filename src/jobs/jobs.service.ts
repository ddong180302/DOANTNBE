import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { Job, JobDocument } from './schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose, { ObjectId } from 'mongoose';
import aqp from 'api-query-params';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import cron from 'node-cron';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) { }
  async create(createJobDto: CreateJobDto, user: IUser) {
    let job = await this.jobModel.create({
      ...createJobDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: job._id,
      createdAt: job.createdAt
    };
  }

  async findAll(
    currentPage: number,
    limit: number,
    qs: string
  ) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    // Thêm điều kiện isActive = true vào filter
    filter.isActive = true;

    let offset = (currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
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

  async getJobByHr(
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
      const totalItems = await this.jobModel.countDocuments({
        ...filter,
        'company._id': userByHr?.company?._id,
      });

      // Tính toán tổng số trang dựa trên giới hạn mặc định
      const totalPages = Math.ceil(totalItems / defaultLimit);

      // Truy xuất CV nếu tìm thấy người dùng HR
      if (userByHr) {
        const result = await this.jobModel.find({
          ...filter,
          'company._id': userByHr?.company?._id,
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
      const totalItems = (await this.jobModel.find(filter)).length;
      const totalPages = Math.ceil(totalItems / defaultLimit);

      const result = await this.jobModel.find(filter)
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

  async getAllJobByComId(id: string) {
    const jobOfCompany = await this.jobModel.find({ 'company._id': id, isDeleted: false });
    const count = await this.jobModel.countDocuments({ 'company._id': id, isDeleted: false });
    return { jobs: jobOfCompany, count: count };
  }


  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "job not found";
    let job = await this.jobModel.findOne({
      _id: id
    })
    return job;
  }

  async countJob() {
    const count = await this.jobModel.countDocuments();
    return count;
  }

  async countJobByHr(user: IUser,) {
    const { _id } = user;
    const userData = await this.userModel.findOne({ _id });
    let idCompany: ObjectId;
    if (userData) {
      idCompany = userData?.company?._id;
    }
    if (idCompany) {
      const count = await this.jobModel.countDocuments({ 'company._id': idCompany, isDeleted: false });
      return count;
    }
  }

  async countJobByHrWithDate(user: IUser, startDate: string, endDate: string) {
    const { _id } = user;
    const userData = await this.userModel.findOne({ _id });
    let idCompany: ObjectId;
    if (userData) {
      idCompany = userData?.company?._id;
    }
    if (idCompany) {
      const count = await this.jobModel.countDocuments({
        'company._id': idCompany,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
      return count;
    }
  }



  async countJobWithDate(startDate: string, endDate: string) {
    const count = await this.jobModel.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    return count;
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "job not found";
    let updatedJob = await this.jobModel.updateOne(
      {
        _id: id
      },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return updatedJob;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "job not found";
    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.jobModel.softDelete({
      _id: id
    });
  }

  //@Cron(CronExpression.EVERY_30_SECONDS)
  @Cron('0 0 * * *')
  async softDeleteExpiredJobs() {
    try {
      const currentDate = new Date();
      const expiredJobs = await this.jobModel.find({ expiredAt: { $lte: currentDate } });
      console.log("expiredJobs: ", expiredJobs)
      // Soft delete expired jobs
      await this.jobModel.updateMany(
        { _id: { $in: expiredJobs.map((job) => job._id) } },
        {
          $set: {
            isDeleted: true,
            deletedAt: currentDate,
          },
        }
      );

      console.log('Soft deleted expired jobs:', expiredJobs.length);
    } catch (error) {
      console.error('Error soft deleting expired jobs:', error);
    }
  }
}
