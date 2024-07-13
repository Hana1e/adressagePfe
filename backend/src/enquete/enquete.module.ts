import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnqueteController } from './enquete.controller';
import { EnqueteService } from './enquete.service';
import { EnquetePolylineModule } from './enquete-polyline/enquete-polyline.module';
import { EnquetePolygoneModule } from './enquete-polygone/enquete-polygone.module';
import { EnqueteSchema } from './schemas/enquete.schema';


@Module({
  controllers: [EnqueteController],
  providers: [EnqueteService],
  imports: [MongooseModule.forFeature([{name:'Enquete' , schema:EnqueteSchema}]), EnquetePolylineModule, EnquetePolygoneModule,
 ]
})
export class EnqueteModule {}
