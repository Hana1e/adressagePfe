import { IsString , IsEmail , IsOptional , MinLength, IsEnum, Matches} from 'class-validator';
import { Role } from '../schemas/user.schema';
export class UpdateUserDto{

    @IsString( )
    @IsOptional()
    readonly name:string;

    @IsEmail()
    @IsOptional()
    readonly email:string;

    
    @IsString()
    @Matches(/^[0-9]{10}$/, { message: 'Le numéro de téléphone doit être un numéro de 10 chiffres.' })
    readonly telephone: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    readonly password?: string;

    @IsOptional()
    @IsEnum(Role ,{message:'please enter correct role'})
    readonly role:Role;
}