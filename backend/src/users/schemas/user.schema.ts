import { Schema ,Prop, SchemaFactory } from "@nestjs/mongoose";

export enum Role{
    ADMIN='Admin',
    ENQUETEUR='Enqueteur',
}

@Schema({
    timestamps:true,
})

export class User{
     @Prop()   //propriete dun schema
     name:string


     @Prop({ unique : [true , 'duplicate email entered']})   
     email:string

     @Prop()   
     telephone:string
     @Prop()   
     password:string

     @Prop()   
     role:Role

     @Prop()
     entrepriseId:string
}

export const UserSchema=SchemaFactory.createForClass(User)