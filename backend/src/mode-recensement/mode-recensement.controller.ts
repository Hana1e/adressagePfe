import { Controller, Post, Body ,Get, HttpException, HttpStatus,Delete,Param, Req, UseGuards} from '@nestjs/common';
import { ModeRecensementService } from './mode-recensement.service';
import { CreateRecensementDto } from './dtos/recensement.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('recensement')
export class ModeRecensementController {
      constructor(private readonly modeRecensementService: ModeRecensementService) {}

      @Post('/geom')
      async create(@Body() createRecensementDto: CreateRecensementDto) {
        const recensement = await this.modeRecensementService.create(createRecensementDto);
        console.log(recensement);  // Vérifiez que l'ID est là
        return recensement;
    }
    
    
    @Get('/geometry/user/:userId')
    @UseGuards(AuthGuard('jwt'))
    async getGeometriesByUserId(@Param('userId') userId: string) {
        try {
            const geometries = await this.modeRecensementService.getGeometryByUserId(userId);
            return geometries;
        } catch (error) {
            throw new HttpException('Failed to fetch geometries for the user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

   
      @Delete('/geom/:id')
      async deleteRecensement(@Param('id') id: string) {
          return await this.modeRecensementService.delete(id);
      }
     
    

    
}
