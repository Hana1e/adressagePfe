
import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, Res, Delete, UseGuards } from '@nestjs/common';
import { EnqueteService } from './enquete.service';
import { CreateEnqueteDto } from './dtos/createEnquete.dto';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

@Controller('enquetes')
export class EnqueteController {
  constructor(private readonly enqueteService: EnqueteService) {}

  @Post()
 
  async create(@Body() createEnqueteDto: CreateEnqueteDto) {
    return this.enqueteService.create(createEnqueteDto);
  }


  @Get()
  async findAll() {
    return this.enqueteService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.enqueteService.findOne(id);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.enqueteService.delete(id);
  }
  @Get('couche/user/:userId')
  @UseGuards(JwtAuthGuard) // Assurez-vous que l'utilisateur est authentifié
  async findLayerByUserId(@Param('userId') userId: string) {
    return this.enqueteService.findLayerByUserId(userId);
  }
  
}
