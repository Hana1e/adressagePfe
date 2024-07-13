import { IsString , IsEnum ,IsOptional} from 'class-validator';
import { TypeVoie } from '../schemas/FormPolyline.schema';
import { Statut } from '../schemas/FormPolyline.schema';
export class updatePolylineDto{
    @IsOptional()
    @IsEnum(TypeVoie ,{message:'please enter correct type'})
    readonly typeVoie:TypeVoie;


    @IsString( )
    @IsOptional()
    readonly ancienNom:string;

    @IsString( )
    @IsOptional()
    readonly nomOfficiel:string;



    @IsOptional()
    @IsString()
    readonly nomUsage:string;


    @IsOptional()
    @IsString()
    readonly numero:string;

    @IsOptional()
    @IsEnum(Statut ,{message:'please enter correct type'})
    readonly statut:Statut;


    


    
}