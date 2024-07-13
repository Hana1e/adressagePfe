import { IsString , IsEmail, IsNotEmpty, MinLength, IsEnum ,Matches} from 'class-validator';
import { Role } from '../schemas/user.schema';

export class signUpDto{
    @IsNotEmpty()
    @IsString()
    readonly name:string;


    @IsNotEmpty()
    @IsEmail({},{message: "please enter correct email"})
    readonly email:string;


    @IsNotEmpty()
    @IsString()
    @Matches(/^[0-9]{10}$/, { message: 'Le numéro de téléphone doit être un numéro de 10 chiffres.' })
    readonly telephone: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password:string;


    @IsNotEmpty()
    @IsEnum(Role ,{message:'please enter correct role'})
    readonly role:Role;
}