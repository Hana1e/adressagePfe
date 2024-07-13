import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EnqueteModule } from './enquete/enquete.module';
import { UsersModule } from './users/users.module';
import { EnquetePolylineModule } from './enquete/enquete-polyline/enquete-polyline.module';
import { EnquetePolygoneModule } from './enquete/enquete-polygone/enquete-polygone.module';
import { AbonnementModule } from './abonnement/abonnement.module';

import { ModeRecensementModule } from './mode-recensement/mode-recensement.module';

import { ModeEnqueteModule } from './mode-enquete/mode-enquete.module';
import { DataModule } from './data/data.module';
import { PolylineModule } from './mode-recensement/polyline.module';
import { PolygonModule } from './mode-recensement/polygon.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:'.env',
      isGlobal:true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),//connect to db
    
     UsersModule,EnqueteModule, EnquetePolylineModule, 
    EnquetePolygoneModule, AbonnementModule, ModeRecensementModule, ModeEnqueteModule, 
    DataModule,PolylineModule ,PolygonModule 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
