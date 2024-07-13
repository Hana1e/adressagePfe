import { IsNotEmpty, IsString } from 'class-validator';

export class FileUploadDto {
    @IsNotEmpty()
    @IsString()  // Assure que le champ est une chaîne de caractères.
    mimeType: string;
}
