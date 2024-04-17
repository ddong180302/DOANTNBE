import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class SkillsService {
  constructor(@InjectModel(Skill.name) private skillModel: SoftDeleteModel<SkillDocument>) { }

  async create(createSkillDto: CreateSkillDto, user: IUser) {
    const { name } = createSkillDto;
    const { _id, email } = user;
    const isExist = await this.skillModel.findOne({
      name: { $regex: new RegExp('^' + name + '$', 'i') }
    });
    if (isExist) {
      const upperCaseName = name.toUpperCase();
      throw new BadRequestException(`Skill với Name = ${upperCaseName}/${name} đã tồn tại!`);
    }
    const newSkill = await this.skillModel.create({
      name,
      createdBy: {
        _id: _id,
        email: email
      }
    })

    return {
      _id: newSkill._id,
      createdAt: newSkill.createdAt
    }
  }

  async findAll(
    currentPage: number,
    limit: number,
    qs: string
  ) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.skillModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.skillModel.find(filter)
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

  async findOne(_id: string) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("Not found skill")
    }
    return await this.skillModel.findById({ _id });

  }

  async update(_id: string, updateSkillDto: UpdateSkillDto, user: IUser) {
    const { name } = updateSkillDto;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("Not found skill")
    }

    const isExist = await this.skillModel.findOne({
      name: { $regex: new RegExp('^' + name + '$', 'i') }
    });
    if (isExist) {
      const upperCaseName = name.toUpperCase();
      throw new BadRequestException(`Skill với Name = ${upperCaseName}/${name} đã tồn tại!`);
    }

    const updated = await this.skillModel.updateOne(
      { _id },
      {
        name,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return updated;

  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("Not found skill")
    }

    await this.skillModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.skillModel.softDelete({
      _id
    });
  }
}
