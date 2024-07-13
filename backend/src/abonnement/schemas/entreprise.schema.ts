import { Schema ,Prop, SchemaFactory } from "@nestjs/mongoose";

import * as mongoose from "mongoose";
import { User } from "src/users/schemas/user.schema";
import { HydratedDocument } from 'mongoose';
import { Abonnement } from "./abonnement.schema";

export type EntrepriseDocument = HydratedDocument<Entreprise>;

@Schema({
    timestamps:true,
})

export class Entreprise{
     @Prop()   //propriete dun schema
     name:string


     @Prop({ unique : [true , 'duplicate email entered']})   
     email:string

     @Prop()   
     telephone:string
     @Prop()   
     adress:string

     @Prop()
     ice:string

     @Prop({type : [mongoose.Schema.Types.ObjectId],ref:"User"})
     employees: User[]

     @Prop({type : [mongoose.Schema.Types.ObjectId],ref:"Abonnement"})
     abonnement:Abonnement
}

export const EntrepriseSchema=SchemaFactory.createForClass(Entreprise)