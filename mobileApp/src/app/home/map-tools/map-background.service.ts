import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapBackgroundService {

  constructor() {}

  changeMapBackground(map: L.Map, mode: 'recensement' | 'enquete'): void {
    let tileLayerUrl: string;
    if (mode === 'recensement') {
      tileLayerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else {
      tileLayerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const newTileLayer = L.tileLayer(tileLayerUrl);
    newTileLayer.addTo(map);
  }
}
