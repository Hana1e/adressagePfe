
import { Body, Controller , Delete, Get, Param, Post,Put,UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { signUpDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from './schemas/user.schema';
import { AuthService } from './auth.service';
@Controller('users')

export class UsersController {
    
    constructor(
        private usersService: UsersService,
        private authService: AuthService,
      ) {}



    @Post('/signup')    //pour enregistrer un user
    async signUp(@Body() signUpDto : signUpDto): Promise<{ message: string, token: string }> {
        const { message, token } = await this.usersService.signUp(signUpDto);
        return { message, token };
    }

 
    @Post('/login')//pour authentification
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.role !== Role.ENQUETEUR) {
        throw new UnauthorizedException('Access denied');
    }

    const { token, userId } = await this.authService.generateToken(user);
    return { message: 'Logged in successful', token, userId };  // Return userId here
  }



    @Get('/allUsers')
    async getAllUsers():Promise<User[]>{
        return this.usersService.findAll()
    }


    @Get(':id')
    async getUser(@Param('id') id:string):Promise<User>{
        return this.usersService.findById(id)
    }

    @Put(':id')
    async updateUser(@Param('id') id:string, @Body() user:UpdateUserDto,):Promise<User>{
        return this.usersService.updateById(id, user);
    }


    @Delete(':id')
    async deleteUser(@Param('id')id:string):Promise<User>{
        return this.usersService.deleteById(id)
    }
}