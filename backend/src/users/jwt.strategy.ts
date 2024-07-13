
//to use this strategy go to the module concernerd and add the usersModule in the imports
//go to the controller of the module (to protect our routes) for example we want to protect createUser(in ou case its signup)
//import @UseGuards(AuthGuard())

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import  {PassportStrategy } from "@nestjs/passport";
import {Strategy,ExtractJwt } from "passport-jwt";
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @InjectModel(User.name)
        private userModel:Model<User>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
            ignoreExpiration: false
        });
    }

    async validate(payload) {
        const user = await this.userModel.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('login first to access this');
        }
        return user;
    }
    
}