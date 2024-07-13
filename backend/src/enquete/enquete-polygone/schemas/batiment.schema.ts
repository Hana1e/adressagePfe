import { Schema,Prop,SchemaFactory } from "@nestjs/mongoose";
export enum Type{
    RESIDENTIEL='résidentiel',
    INDUSTRIEL='industriel',
    COMMERCIAL='commercial',
}

@Schema(
    {
        timestamps:true,
    }
)
export class Batiment{
    @Prop() 
    nom:string
    @Prop() 
    nomRue:string
    @Prop() 
    numeroRue:string
    @Prop() 
    nombreNiveaux:number
    @Prop() 
    type:Type
}
export const FormPolylineSchema=SchemaFactory.createForClass(Batiment)