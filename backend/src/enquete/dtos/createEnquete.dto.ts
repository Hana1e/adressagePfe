import { IsNotEmpty, IsEnum, IsMongoId, IsDateString } from 'class-validator';
import { Type } from '../schemas/enquete.schema';

export class CreateEnqueteDto {
    enqueteurId: string;
    layerId: string;
    layerName: string;
    type: string;
    dateAttribution: Date;
    enqueteurName?: string;
}
