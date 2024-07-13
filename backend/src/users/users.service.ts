import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { signUpDto} from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { EmailService } from './email.service';
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)//we are injecting the user model created by mongoose
        private userModel: Model<User>,
        private jwtService: JwtService,
        private emailService: EmailService
    ) {}


    async signUp(signUpDto: signUpDto) : Promise<{ message: string, token: string }>{
        const {name , email ,telephone,password , role}=signUpDto
        //pour verifier l'existance d'email
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new BadRequestException('Cet e-mail est déjà utilisé.');
        } 
        const hashedPassword= await bcrypt.hash(password,10)

        const user = await this.userModel.create({
            name,
            email,
            telephone,
            password:hashedPassword,
            role
        })

        const token = this.jwtService.sign({ id: user._id });
        try {
            await this.emailService.sendPasswordEmail(user.email, password);
            console.log('Email sent to:', user.email);
          } catch (error) {
            console.error('Error sending email:', error);
            throw new BadRequestException('Failed to send email.');
          }
        return { message: 'Signup successful', token };

    }


    async login(loginDto: LoginDto):  Promise<{ message: string, token: string }>{
        const {email ,password }=loginDto;
        const user=await this.userModel.findOne({email})
        if(!user){
            throw new UnauthorizedException('invalid email or password')
        }
        const isPasswordMatched= await bcrypt.compare(password,user.password)
        if(! isPasswordMatched){
            throw new UnauthorizedException('invalid email or password')
        }
        const token = this.jwtService.sign({ id: user._id });
        return { message: 'Logged in successful', token };
        }  

        async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
        }

        async validatePassword(user: User, password: string): Promise<boolean> {
            return bcrypt.compare(password, user.password);
        }

        async findAll():Promise<User[]>{
            const users=await this.userModel.find();
            return users;

        }


        async findById(id:string):Promise<User>{
            const isValidId=mongoose.isValidObjectId(id);
            if(!isValidId){
                throw new BadRequestException('please enter correct id ');
            }
            const user=await this.userModel.findById(id);
            if(!user){
                throw new NotFoundException('user not found');
            }
            return user;

        }



        async updateById(id: string, user: UpdateUserDto): Promise<User> {
            return await this.userModel.findByIdAndUpdate(id, user, {
                new: true,
                runValidators: true,
            });
        }


        async deleteById(id: string): Promise<User> {
            return await this.userModel.findByIdAndDelete(id);
        }
       
}