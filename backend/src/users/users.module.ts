import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import {PassportModule} from '@nestjs/Passport'; // utilisé pour gérer l'authentification dans les applications
import {JwtModule} from '@nestjs/jwt';//fournit fonctionnalités pour la gestion des JSON Web Tokens (JWT)
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

import { AuthService } from './auth.service';
import { EmailService } from './email.service';
@Module({
  imports:[
    PassportModule.register({defaultStrategy:'jwt'}),
    JwtModule.registerAsync({
      inject:[ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string | number>('JWT_EXPIRES'), 
        },
      }),
    }),
    MongooseModule.forFeature([{name:'User' , schema:UserSchema}])//allow us to inject this model into any file that it needs it
    //im creating a Mongoose model named 'User' that follows the structure defined by the UserSchema.
  
    
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy,AuthService,  EmailService],
  exports:[JwtStrategy, PassportModule] //so they can be used in other module 
})
export class UsersModule {}