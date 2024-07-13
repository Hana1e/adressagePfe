import { Body, Controller, Get, Param, Post, Put,Delete } from '@nestjs/common';
import { EnquetePolylineService } from './enquete-polyline.service';
import { FormPolyline } from './schemas/FormPolyline.schema';
import { createPolylineDto } from './dtos/create.polyline.dto';
import { updatePolylineDto } from './dtos/update.polyline.dto';

@Controller('polylines')
export class EnquetePolylineController {
    constructor(private enquetePolylineService: EnquetePolylineService){}

    @Get('/AllPolylines')
    async getAllPolylines (): Promise<FormPolyline[]>{
        return this.enquetePolylineService.findAll();
    }

    @Post('/new')
    async createPolyline(
        @Body()
        formPolyline:createPolylineDto
    ):Promise<FormPolyline>{
        return this.enquetePolylineService.create(formPolyline);
    }



    @Get(':id')
    async getPolyline (@Param('id') id:string): Promise<FormPolyline>{
        return this.enquetePolylineService.findById(id);
    }


    @Put(':id')
    async updatePolyline(
        @Param('id') id:string, //get the id from the param 
        @Body() formPolyline:updatePolylineDto //get the formPolyline from the body
    ):Promise<FormPolyline>{
        return this.enquetePolylineService.updateById(id,formPolyline);
    }


    @Delete(':id')
    async deleteUser(
        @Param('id')
        id:string
    ):Promise<FormPolyline>{
        return this.enquetePolylineService.deleteById(id)
    }
}
