import { Injectable } from '@angular/core';
import  L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class ImportGeoTIFFService {

  constructor() { }

  async loadGeoTIFF(map: L.Map, file: File): Promise<void> {
    try {
      const url = URL.createObjectURL(file);
      const geoTIFFLayer = await L.leafletGeotiff(url).addTo(map);
    } catch (error) {
      console.error('Une erreur s\'est produite lors du chargement du GeoTIFF :', error);
      throw error;
    }
  }
}
