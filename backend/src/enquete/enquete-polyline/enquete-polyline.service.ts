import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FormPolyline } from './schemas/FormPolyline.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class EnquetePolylineService {
    constructor(
        @InjectModel(FormPolyline.name)
        private formPolylineModel:mongoose.Model<FormPolyline>
    ){}


    async findAll():Promise <FormPolyline[]>{
        const polylines= await this.formPolylineModel.find()
        return polylines
    }


    async create(formPolyline:FormPolyline):Promise <FormPolyline>{
        const res= await this.formPolylineModel.create(formPolyline)
        return res
    }



    async findById(id:string):Promise <FormPolyline>{
        const polyline= await this.formPolylineModel.findById(id)
        if(!polyline){
            throw new NotFoundException('Polyline not found')
        }
        return polyline
    }



    async updateById(id:string, formPolyline:FormPolyline):Promise <FormPolyline>{
        const updatedPolyline = await this.formPolylineModel.findByIdAndUpdate(id,formPolyline,{ //findByIdAndUpdate fnct predefinie fournie par mongoose
            new:true,
            runValidators:true,
        })  
        if (!updatedPolyline) {
            throw new NotFoundException('Polyline not found');
        } 
        return updatedPolyline;
    }

    async deleteById(id: string): Promise<FormPolyline> {
        return await this.formPolylineModel.findByIdAndDelete(id);
    }

}
