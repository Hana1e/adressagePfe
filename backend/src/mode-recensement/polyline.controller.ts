// polyline.controller.ts
import { Controller, Post, Body, Get, Param, Delete, HttpException, HttpStatus, BadRequestException, Query, NotFoundException } from '@nestjs/common';
import { PolylineService } from './polyline.service';
import { CreatePolylineDto } from './dtos/polyline.dto';


@Controller('recensement')
export class PolylineController {
    constructor(private readonly polylineService: PolylineService) {}

    @Post('/polyline')
    async createPolyline(@Body() createPolylineDto: CreatePolylineDto) {
        try {
            const newPolyline = await this.polylineService.createPolyline(createPolylineDto);
            return newPolyline;
        } catch (error) {
            throw new HttpException('Failed to create polyline', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Get('/geometrys/user/:userId/polyline') // Utilisez une route spécifique pour les polylines
    async getPolylinesByUserId(@Param('userId') userId: string) {
      try {
        const polylines = await this.polylineService.getPolylinesByUserId(userId);
        return polylines;
      } catch (error) {
        throw new HttpException('Failed to fetch polylines for the user', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Delete('/polyline/:id')
    async deletePolyline(@Param('id') id: string) {
      try {
        return await this.polylineService.deletePolyline(id);
      } catch (error) {
        throw new HttpException('Failed to delete polyline', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    
    

    @Get('/polyline/:polylineId/address')
    async getAddressFromPolylineId(@Param('polylineId') polylineId: string) {
        try {
            const address = await this.polylineService.getAddressFromPolylineId(polylineId);
            return { address };
        } catch (error) {
            throw new HttpException('Failed to fetch polyline address', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @Get('/allAddresses')
    async getAllAddresses() {
        try {
            const addresses = await this.polylineService.getAllAddresses();
            return addresses;
        } catch (error) {
            throw new HttpException('Failed to fetch addresses', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Get('/polyline/address/:address')
async getPolylineByAddress(@Param('address') address: string) {
    try {
        const polyline = await this.polylineService.getPolylineByAddress(address);
        return polyline;
    } catch (error) {
        throw new HttpException('Failed to fetch polyline by address', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

@Post('/polyline/:id/reference-point')
async addReferencePointToPolyline(@Param('id') id: string, @Body() referencePoint: any) {
  try {
    const updatedPolyline = await this.polylineService.addReferencePoint(id, referencePoint);
    return updatedPolyline;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new HttpException('Polyline already has a reference point', HttpStatus.BAD_REQUEST);
    }
    throw new HttpException('Failed to add reference point to polyline', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Get('/polyline/:polylineId/reference-point')
async getPolylineReferencePoint(@Param('polylineId') polylineId: string) {
    try {
        const referencePoint = await this.polylineService.getPolylineReferencePoint(polylineId);
        return referencePoint;
    } catch (error) {
        throw new HttpException('Failed to fetch polyline reference point', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

@Get('voies-details/user/:userId')
  async getVoiesDetailsByUserId(@Param('userId') userId: string) {
    return await this.polylineService.getVoiesDetailsByUserId(userId);
  }


  @Get('/polyline/address/:address/reference-point')
    async getReferencePointByAddress(@Param('address') address: string) {
        try {
            const referencePoint = await this.polylineService.getReferencePointByAddress(address);
            if (referencePoint === null) {
                return { message: 'No reference point found for the given address' };
            }
            return referencePoint;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Failed to fetch reference point by address', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
  //_________________________________________________
  //pour webSig
  @Get('/polyline/search/:query')
  async searchAddresses(@Param('query') query: string) {
    try {
      const addresses = await this.polylineService.searchAddresses(query);
      return addresses;
    } catch (error) {
      throw new HttpException('Failed to search addresses', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('/polyline/geometry/:adresse')
  async getAddressGeometry(@Param('adresse') adresse: string) {
    try {
      const geometry = await this.polylineService.getAddressGeometry(adresse);
      return geometry;
    } catch (error) {
      throw new HttpException('Failed to get address geometry', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('/polyline/checkIntersection/:latitude/:longitude')
async checkIntersection(
    @Param('latitude') latitude: number,
    @Param('longitude') longitude: number,
): Promise<{ adresse?: string }> {
    try {
        const result = await this.polylineService.checkIntersection(latitude, longitude);
        return result;
    } catch (error) {
        throw new HttpException('Failed to check intersection', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


  
}
