import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus,Get ,Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataService } from './data.service';
import { CreateGeometryDto } from './dtos/createGeometry.dto';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    if (!file) throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    if (!file.originalname.match(/\.(zip)$/i)) throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);

    try {
      const result = await this.dataService.processZipFile(file);
      return { message: 'File processed successfully', data: result };
    } catch (error) {
      throw new HttpException('Failed to process file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/layers')
  async getLayers(): Promise<any> {
  try {
    const layers = await this.dataService.getAllLayers();
    return { status: 'success', data: layers };
  } catch (error) {
    throw new HttpException('Failed to get layers', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Get('layer/:id')
async getLayer(@Param('id') id: string): Promise<any> {
  try {
    const layer = await this.dataService.getLayerById(id);
    return { status: 'success', data: layer };
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.NOT_FOUND,
      error: 'Layer not found',
    }, HttpStatus.NOT_FOUND);
  }
}

@Post('geometry')
async saveGeometry(@Body() createGeometryDto: CreateGeometryDto): Promise<any> {
    return this.dataService.saveGeometry(createGeometryDto.geoJSON, createGeometryDto.layerName);
}

}
