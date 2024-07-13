import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolygonSchema } from './schemas/polygon.schema';
import { PolygonService } from './polygon.service';
import { PolygonController } from './polygon.controller';
@Module({
 
  imports: [MongooseModule.forFeature([{name:'Polygon' , schema:PolygonSchema}])],
  providers: [PolygonService],
  controllers: [PolygonController ],
})
export class PolygonModule {}
