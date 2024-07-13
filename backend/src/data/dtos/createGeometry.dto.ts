import { IsNotEmpty, IsObject } from 'class-validator';

export class CreateGeometryDto {
    @IsNotEmpty()
    @IsObject()
    geoJSON: any;

    @IsNotEmpty()
    layerName: string;
}