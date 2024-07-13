import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateRecensementDto {

    readonly geoJSON: any;
    readonly createdBy: string;
    readonly nomEntite: string;
    readonly typsedevoie: string;
}