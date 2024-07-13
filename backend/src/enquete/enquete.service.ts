// src/enquetes/enquete.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enquete, EnqueteDocument } from './schemas/enquete.schema';
import { CreateEnqueteDto } from './dtos/createEnquete.dto';


@Injectable()
export class EnqueteService {
  constructor(@InjectModel(Enquete.name) private enqueteModel: Model<EnqueteDocument>) {}

  async create(createEnqueteDto: CreateEnqueteDto): Promise<Enquete> {
    const createdEnquete = new this.enqueteModel(createEnqueteDto);
    return createdEnquete.save();
}
  async findLayerByUserId(userId: string): Promise<any> {
    const result = await this.enqueteModel.findOne({ enqueteurId: userId }).exec();
    if (!result) {
        return null;
    }
    return { layerId: result.layerId }; 
  }

  async findAll(): Promise<Enquete[]> {
    return this.enqueteModel.find().exec();
  }

  async findOne(id: string): Promise<Enquete> {
    return this.enqueteModel.findById(id).exec();
  }
  async delete(id: string): Promise<any> {
    return this.enqueteModel.deleteOne({ _id: id }).exec();
  }

 
}
