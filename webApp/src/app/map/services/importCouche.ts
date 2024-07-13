
//Pour affichage /ancienne version
import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { parseShp ,parseGeojson } from 'shpjs';

@Injectable({
  providedIn: 'root'
})
export class ImportCoucheService {
  constructor() { }

  async processZipFile(file: File): Promise<any[]> {
    try {
      if (!file || !file.name.toLowerCase().endsWith('.zip')) {
        throw new Error('Le fichier doit être un fichier ZIP.');
      }
  
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
  
      const importedData: any[] = [];
      const colors: string[] = this.generateRandomColors(Object.keys(zipData.files).length); 
  
      let index = 0;
      for (const fileName in zipData.files) {
        const lowerCaseFileName = fileName.toLowerCase();
        if (lowerCaseFileName.endsWith('.shp')) {
          const shpData = await zipData.files[fileName].async('arraybuffer');
          const shapefile = parseShp(shpData);
          shapefile.color = colors[index];
          shapefile.name = this.extractLayerName(fileName);
          importedData.push(shapefile);
          index++;
        } else if (lowerCaseFileName.endsWith('.geojson')) {
          const geojsonData = await zipData.files[fileName].async('string');
          const geojson = JSON.parse(geojsonData);
          geojson.color = colors[index];
          geojson.name = this.extractLayerName(fileName);
          importedData.push(geojson);
          index++;
        }
      }
  
      return importedData;
    } catch (error) {
      console.error('Une erreur s\'est produite lors du traitement du fichier ZIP :', error);
      throw error;
    }
  }

  private extractLayerName(fileName: string): string {
    const parts = fileName.split('/');
    const fileNamePart = parts[parts.length - 1];
    return fileNamePart.replace('.shp', '').replace('.geojson', '');
  }

  private generateRandomColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16); 
      colors.push(color);
    }
    return colors;
  }
}
