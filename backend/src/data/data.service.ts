import { Injectable } from '@nestjs/common';
import * as JSZip from 'jszip';
import * as shapefile from 'shapefile';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Data, DataDocument } from './schemas/data.schema';

@Injectable()
export class DataService {
  constructor(@InjectModel('Data') private dataModel: Model<DataDocument>) {}

  async processZipFile(file: Express.Multer.File): Promise<any> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file.buffer);
    const geojsons = [];

    for (const filename of Object.keys(contents.files)) {
      if (filename.endsWith('.shp')) {
        const layerName = filename.slice(0, -4); 
        const shpBuffer = await contents.files[filename].async('nodebuffer');
        const dbfFilename = filename.replace('.shp', '.dbf');
        const dbfBuffer = contents.files[dbfFilename] ? await contents.files[dbfFilename].async('nodebuffer') : null;

        let geojson;
        if (dbfBuffer) {
          geojson = await shapefile.read(shpBuffer, dbfBuffer);
        } else {
          
          geojson = await shapefile.read(shpBuffer);
        }

        geojsons.push({ geoJSON: geojson, layerName: layerName });
      }
    }

    // Enregistrer chaque GeoJSON avec son nom de couche séparément
    const savedGeoJSONs = await Promise.all(
      geojsons.map(g => this.saveGeoJSON(g.geoJSON, g.layerName))
    );
    return savedGeoJSONs;
  }

  private async saveGeoJSON(geoJSON: any, layerName: string): Promise<Data> {
    const newData = new this.dataModel({ geoJSON, layerName });
    return newData.save();
  }

  
  async getAllLayers(): Promise<Data[]> {
    return this.dataModel.find().exec();
  }
  async getLayerById(id: string): Promise<Data> {
    try {
      const layer = await this.dataModel.findById(id).exec();
      if (!layer) {
        throw new Error('Layer not found');
      }
      return layer;
    } catch (error) {
      throw new Error('Error retrieving layer: ' + error.message);
    }
  }
  async saveGeometry(geoJSON: any, layerName: string): Promise<any> {
    const newData = new this.dataModel({ geoJSON, layerName });
    return newData.save();
}
  
}


