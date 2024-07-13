import { Controller, Post, Body, Get, Param, Delete, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Query, BadRequestException } from '@nestjs/common';
import { PolygonService } from './polygon.service';
import { CreatePolygonDto } from './dtos/polygon.dto';

@Controller('recensement')
export class PolygonController {
    constructor(private readonly polygonService: PolygonService) {}

    @Post('/polygon')
    async createPolygon(@Body() createPolygonDto: CreatePolygonDto) {
        try {
            const newPolygon = await this.polygonService.createPolygon(createPolygonDto);
            return newPolygon;
        } catch (error) {
            console.error('Failed to create polygon:', error);
            throw new InternalServerErrorException('Failed to create polygon');
        }
    }
    //pour adress immeuble apres numerotation 
    @Post('/add-final-address/:id')
    async addFinalAddressImmeuble(
      @Param('id') id: string,
      @Body('adresseFinalImmeuble') adresseFinalImmeuble: string,
      @Body('distance') distance: number,
      @Body('rive') rive?: string,  
      @Body('sequentialNumber') sequentialNumber?: number,  
    ) {
      try {
        console.log(`Requête reçue pour ajouter une adresse finale au polygone avec ID: ${id}`);
        const updatedPolygon = await this.polygonService.addFinalAddressImmeuble(id, adresseFinalImmeuble, distance, rive,sequentialNumber); 
        return updatedPolygon;
      } catch (error) {
        console.error('Failed to add final address for immeuble:', error);
        throw new InternalServerErrorException('Failed to add final address for immeuble');
      }
    }
    

    @Get('/sequential-numbers')
    async getSequentialNumbersByPartialAddress(@Query('address') address: string) {
        try {
            console.log(`Requête reçue pour obtenir les sequential numbers pour l'adresse partielle: ${address}`);
            const sequentialNumbers = await this.polygonService.getSequentialNumberByPartialAddress(address);
            return { sequentialNumbers };
        } catch (error) {
            console.error('Failed to get sequential numbers by address:', error);
            throw new InternalServerErrorException('Failed to get sequential numbers by address');
        }
    }


    @Get('/address-exists')
    async doesAddressWithSameDistanceExist(@Query('address') address: string, @Query('distance') distance: number) {
        try {
            const exists = await this.polygonService.doesAddressWithSameDistanceExist(address, distance);
            return { exists };
        } catch (error) {
            console.error('Failed to check address with same distance:', error);
            throw new InternalServerErrorException('Failed to check address with same distance');
        }
    }
  @Get('/addresses')
  async getAddressesWithStreetAndDistance(
    @Query('street') street: string,
    @Query('distance') distance: number
  ) {
    if (!street || distance === undefined || distance === null) {
      throw new BadRequestException('Street and distance must be provided');
    }
    return this.polygonService.findAddressesWithStreet(street, distance);
  }

  @Get('/addressesDistance')
    async checkAddressWithSameDistance(
        @Query('address') address: string,
        @Query('distance') distance: number
    ): Promise<boolean> {
        if (!address || distance === undefined || distance === null) {
            throw new BadRequestException('Address and distance must be provided');
        }
        return this.polygonService.doesAddressWithSameDistanceExist(address, distance);
    }
    @Get(':id/code-postal')
    async getCodePostalQuartier(@Param('id') quartierId: string): Promise<number | undefined> {
      try {
          return await this.polygonService.getCodePostalQuartier(quartierId);
      } catch (error) {
          console.error('Error fetching postal code for quartier:', error);
          throw new InternalServerErrorException('Failed to retrieve postal code for quartier');
      }
  }
  
    


    @Get('/quartiers')
    async getQuartiers() {
      try {
        const quartiers = await this.polygonService.getQuartiers();
        return quartiers;
      } catch (error) {
        throw new HttpException('Failed to fetch quartiers', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get('/quartiers/geometries')
    async getQuartierGeometries() {
        try {
            const quartierGeometries = await this.polygonService.getQuartierGeometries();
            return quartierGeometries;
        } catch (error) {
            throw new HttpException('Failed to fetch quartier geometries', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Get('immeuble-addresses')
    async getImmeubleAddresses() {
        try {
            return await this.polygonService.getImmeubleAddresses();
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch immeuble addresses');
        }
    }
//for new drawn immeubles
    @Get('immeuble-addresses/:id')
    async getAddressById(@Param('id') id: string) {
      try {
        const address = await this.polygonService.getAddressById(id);
        if (!address) {
          throw new NotFoundException('Address not found');
        }
        return address;
      } catch (error) {
        throw new InternalServerErrorException('Failed to fetch address');
      }
    }

    @Get('/geometrys/user/:userId/polygon') 
  async getPolygonsByUserId(@Param('userId') userId: string) {
    try {
      const polygons = await this.polygonService.getPolygonsByUserId(userId);
      return polygons;
    } catch (error) {
      throw new HttpException('Failed to fetch polygons for the user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/polygon/:id')
  async deletePolygon(@Param('id') id: string) {
    try {
      return await this.polygonService.deletePolygon(id);
    } catch (error) {
      throw new HttpException('Failed to delete polygon', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('/quartiers/:userId')
  async getQuartiersByUserId(@Param('userId') userId: string) {
      try {
          const quartiers = await this.polygonService.getQuartiersByUserId(userId);
          return quartiers;
      } catch (error) {
          throw new HttpException('Failed to fetch quartiers by user', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  @Get('/quartier/:id')
    async getQuartierNameById(@Param('id') id: string) {
        try {
            const quartierName = await this.polygonService.getQuartierNameById(id);
            return { nomQuartier: quartierName };
        } catch (error) {
            console.error('Failed to fetch quartier name by ID:', error);
            throw new HttpException('Failed to fetch quartier name by ID', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/immeuble-final-address/:id')
    async getFinalAddressById(@Param('id') id: string) {
        try {
            const finalAddress = await this.polygonService.getFinalAddressById(id);
            return { adresseFinalImmeuble: finalAddress };
        } catch (error) {
            throw new HttpException('Failed to fetch final address for immeuble', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
  //pour webSig 
  @Get('/entities/search/:startingLetter')
  async searchEntitiesByStartingLetter(@Param('startingLetter') startingLetter: string) {
    try {
      const results = await this.polygonService. searchEntities(startingLetter);
      return results;
    } catch (error) {
      throw new HttpException('Failed to search entities by starting letter', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/quartiers/geometry/:nomQuartier')
  async getQuartierGeometry(@Param('nomQuartier') nomQuartier: string) {
    try {
      const geometry = await this.polygonService.getQuartierGeometry(nomQuartier);
      return geometry;
    } catch (error) {
      throw new HttpException('Failed to get quartier geometry', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('/immeubles/geometry/:adresseImmeuble')
  async getImmeubleGeometry(@Param('adresseImmeuble') adresseImmeuble: string) {
    try {
      const geometry = await this.polygonService.getImmeubleGeometry(adresseImmeuble);
      return geometry;
    } catch (error) {
      throw new HttpException('Failed to get immeuble geometry', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/checkIntersection/:latitude/:longitude')
async checkIntersection(
    @Param('latitude') latitude: number,
    @Param('longitude') longitude: number,
): Promise<{ adresseImmeuble: string }> {
    try {
        const result = await this.polygonService.checkIntersection(latitude, longitude);
        return result;
    } catch (error) {
        throw new HttpException('Failed to check intersection', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}



}
