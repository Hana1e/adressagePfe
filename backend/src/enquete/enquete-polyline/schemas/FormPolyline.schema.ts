import { Schema,Prop,SchemaFactory } from "@nestjs/mongoose";

export enum TypeVoie{
    AVENUE='avenue',
    RUE='rue',
    BOULEVARD='boulevard',
    CHEMIN='chemin',
}

export enum Statut{
    PPRIVE='propriété privée',
    DPUBLIQUE='dominalité publique',

}

@Schema(
    {
        timestamps:true,// pour que les horodatages (created updated at) s'ajoutent automatiquement aux docs ds monodb
         
    }
)

export class FormPolyline{
    @Prop()   
    typeVoie:TypeVoie
    @Prop() 
    ancienNom:string

    @Prop() 
    nomOfficiel:string

    

    @Prop() 
    nomUsage:string

    @Prop() 
    numero:string

    @Prop() 
    statut:Statut


}
export const FormPolylineSchema=SchemaFactory.createForClass(FormPolyline)//pour creer schema mongoose a partir de cette class