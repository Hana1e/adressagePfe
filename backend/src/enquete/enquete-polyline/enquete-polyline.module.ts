import { Module } from '@nestjs/common';
import { EnquetePolylineController } from './enquete-polyline.controller';
import { EnquetePolylineService } from './enquete-polyline.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FormPolylineSchema } from './schemas/FormPolyline.schema';
@Module({
  imports:[MongooseModule.forFeature([{name:'FormPolyline' , schema:FormPolylineSchema}])],
  controllers: [EnquetePolylineController],
  providers: [EnquetePolylineService]
})
export class EnquetePolylineModule {}
