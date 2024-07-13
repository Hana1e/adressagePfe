// polyline.dto.ts
import { IsNotEmpty, IsString ,IsOptional} from 'class-validator';

export class CreatePolylineDto {
    @IsNotEmpty()
    geoJSON: any;

    @IsNotEmpty()
    createdBy: string;

    @IsNotEmpty()
    nomOfficiel: string;
    @IsNotEmpty()
    nomUsage: string;

    @IsNotEmpty()
    typedevoie: string;
    @IsOptional() 
    numeroVoie?: string;
    @IsNotEmpty()
    statut: string;
    @IsNotEmpty()
    distance:string; 
    @IsOptional() 
    nomQuartier ?: string;
    @IsOptional() 
    quartierId?: string;
    @IsOptional() 
    adresse?: string;

    @IsOptional()
    referencePoint?: any;
}
