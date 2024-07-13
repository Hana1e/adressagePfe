import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecensementSchema } from './schemas/recensement.schema';
import { ModeRecensementService } from './mode-recensement.service';
import { ModeRecensementController } from './mode-recensement.controller';

@Module({
 
  imports: [MongooseModule.forFeature([{name:'Recensement' , schema:RecensementSchema}])],
  providers: [ModeRecensementService],
  controllers: [ModeRecensementController],
})
export class ModeRecensementModule {}
