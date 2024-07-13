import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';


import { PolylineSchema } from './schemas/polyline.schema';
import { PolylineController } from './polyline.controller';
import { PolylineService } from './polyline.service';
import { PolygonSchema } from './schemas/polygon.schema';
import { PolygonService } from './polygon.service';
@Module({
 
  imports: [MongooseModule.forFeature([{name:'Polyline' , schema:PolylineSchema}, { name: 'Polygon', schema: PolygonSchema },])],
  providers: [PolylineService,PolygonService],
  controllers: [PolylineController],
})
export class PolylineModule {}
