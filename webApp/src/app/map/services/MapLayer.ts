// Pour afficher all layers
import { Injectable } from '@angular/core';
import L from 'leaflet';
import { GeoDataService } from '../../services/GeoData.service';

@Injectable({
  providedIn: 'root'
})
export class MapLayerService {
  private map: L.Map;
  private mapLayers: L.Layer[] = [];

  constructor(private geoDataService: GeoDataService) {}

  initializeMap(map: L.Map) {
    this.map = map;
  }

  loadLayers(): void {
    this.geoDataService.getAllLayers().subscribe({
      next: (response) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.clearLayers();
          this.addLayers(response.data);
        } else {
          console.error('Data is not an array or status is not success:', response);
        }
      },
      error: (error) => {
        console.error('Failed to load layers:', error);
      }
    });
  }
 

  private clearLayers(): void {
    this.mapLayers.forEach(layer => {
      this.map.removeLayer(layer);
    });
    this.mapLayers = [];
  }

  private addLayers(data: any[]): void {
    data.forEach(layerData => {
      const color = this.getRandomColor();
      const geoJsonLayer = L.geoJSON(layerData.geoJSON, {
        style: () => ({
          color: color,
          weight: 5,
          opacity: 0.7
        }),
        onEachFeature: (feature, layer) => {
          const popupContent = `Nom de la zone: ${layerData.layerName || 'pas de nom'}`;
          layer.bindPopup(popupContent);
        }
      }).addTo(this.map);
      this.mapLayers.push(geoJsonLayer);
    });
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
