import { IsString , IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto{
 


    @IsNotEmpty()
    @IsEmail({},{message: "please enter correct email"})
    readonly email:string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password:string;

}


    