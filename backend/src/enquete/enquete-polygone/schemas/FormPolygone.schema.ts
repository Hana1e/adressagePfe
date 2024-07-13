import { Schema,Prop,SchemaFactory } from "@nestjs/mongoose";

export enum TypeEntite{
    BATIMENT='batiment',
    PARCELLE='parcelle',
    ESPACEVERT='Espace vert',
    JARDIN='jardin',
    CIMETIERE='Cimetière',
    GARE='gare',
    RESTAURANT='restaurant',
}
@Schema(
    {
        timestamps:true,    
    }
)

export class FormPolygone{
    @Prop()   
    typeEntite:TypeEntite
    @Prop() 
    nombreNiveaux:number
}
export const FormPolylineSchema=SchemaFactory.createForClass(FormPolygone)//pour creer schema mongoose a partir de cette class