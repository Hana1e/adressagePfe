import { Module } from '@nestjs/common';
import { EnquetePolygoneService } from './enquete-polygone.service';
import { EnquetePolygoneController } from './enquete-polygone.controller';

@Module({
  providers: [EnquetePolygoneService],
  controllers: [EnquetePolygoneController]
})
export class EnquetePolygoneModule {}
