import { Schema ,Prop, SchemaFactory } from "@nestjs/mongoose";

import * as mongoose from "mongoose";
import { User } from "src/users/schemas/user.schema";
import { HydratedDocument } from 'mongoose';
import { Entreprise } from "./entreprise.schema";

export type AbonnementDocument = HydratedDocument<Abonnement>;

@Schema({
    timestamps:true,
})

export class Abonnement{
     @Prop()   //propriete dun schema
     id:string;

     @Prop()   
     actif:boolean;

     @Prop({type : [mongoose.Schema.Types.ObjectId],ref:"Entreprise"})
     entreprise:Entreprise


    
}

export const AbonnementSchema=SchemaFactory.createForClass(Abonnement)