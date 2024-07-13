import { IsString , IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { TypeVoie } from '../schemas/FormPolyline.schema';
import { Statut } from '../schemas/FormPolyline.schema';
export class createPolylineDto{
    @IsNotEmpty()
    @IsEnum(TypeVoie ,{message:'please enter correct type'})
    readonly typeVoie:TypeVoie;

    @IsNotEmpty()
    @IsString()
    readonly ancienNom:string;

    @IsNotEmpty()
    @IsString()
    readonly nomOfficiel:string;



    @IsNotEmpty()
    @IsString()
    readonly nomUsage:string;


    @IsNotEmpty()
    @IsString()
    readonly numero:string;

    @IsNotEmpty()
    @IsEnum(Statut ,{message:'please enter correct type'})
    readonly statut:Statut;


    


    
}