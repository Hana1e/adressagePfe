import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePolygonDto {
    @IsNotEmpty()
    geoJSON: any;

    @IsNotEmpty()
    createdBy: string;

    @IsNotEmpty()
    @IsString()
    nomEntite: string; // Choisir le nom de l'entité: quartier ou type d'immeuble
    @IsOptional()
    @IsString()
    nomQuartier?: string; // Champ facultatif, utilisé si l'entité est un quartier
    @IsOptional()
    @IsString()
    typeQuartier?: string;
    @IsOptional()
    @IsString()
    typeImmeuble?: string;
    @IsOptional()
    @IsString()
    nomImmeuble?: string;
    @IsOptional()
    @IsString()
    Quartier?: string;
    @IsNotEmpty()
    @IsString()
    area: string; 
    @IsOptional()
    @IsNumber()
    nombreEtages?: number;
    @IsOptional()
    @IsString()
    layerId?: string;
    @IsOptional()
    @IsString()
    description?: string;
    @IsOptional()
    @IsString()
    adresseImmeuble?: string;
    @IsOptional()
    @IsString()
    adresseFinalImmeuble?: string;
    @IsOptional()
    @IsNumber() 
    distance?: number;
    @IsOptional()
    @IsString()
    rive?: string;
    @IsOptional()
    @IsNumber()
    codePostal?: number;
    @IsOptional()
    @IsNumber()
    codePostalQuartier?: number; 
    @IsOptional()
    @IsNumber()
    sequentialNumber?: number; 
    

}
