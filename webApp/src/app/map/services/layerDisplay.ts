//pour choisir la couche a affichee
import { Injectable } from '@angular/core';
import L from 'leaflet';
import { GeoDataService } from '../../services/GeoData.service';

@Injectable({
  providedIn: 'root'
})
export class LayerDisplayService {

  constructor(private geoDataService: GeoDataService) { }

  displaySelectedLayers(event: Event, map: L.Map): string[] {
    event.preventDefault();
    const formElement = event.target as HTMLFormElement;
    const selectElement = formElement.querySelector('select');

    if (!selectElement) {
      console.error('Select element is not found');
      return [];
    }

    const selectedLayers = Array.from(selectElement.selectedOptions, option => option.value);
    this.updateMapWithSelectedLayers(map, selectedLayers);
    return selectedLayers;
  }

  updateMapWithSelectedLayers(map: L.Map, selectedLayers: string[]): void {
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    selectedLayers.forEach(layerId => {
      this.geoDataService.getLayerById(layerId).subscribe({
        next: (response) => {
          const layerData = response.data;
          const color = this.getRandomColor();  // Générer une couleur aléatoire pour chaque couche
          L.geoJSON(layerData.geoJSON, {
            style: () => ({
              color: color,  // Utiliser la couleur aléatoire pour la bordure
              fillColor: color,  // Utiliser la même couleur aléatoire pour le remplissage
              weight: 2,
              fillOpacity: 0.5
            }),
            onEachFeature: (feature, layer) => {
              if (feature.properties) {
                layer.bindPopup(Object.keys(feature.properties).map(property => `${property}: ${feature.properties[property]}`).join('<br />'));
              }
            }
          }).addTo(map);
        },
        error: (error) => console.error('Error loading layer', error)
      });
    });
  }

  private getRandomColor(): string {
    // Générer une couleur RGB aléatoire
    const r = Math.floor(Math.random() * 256);  // Rouge de 0 à 255
    const g = Math.floor(Math.random() * 256);  // Vert de 0 à 255
    const b = Math.floor(Math.random() * 256);  // Bleu de 0 à 255
    return `rgb(${r},${g},${b})`;  // Retourner la chaîne de couleur au format RGB
  }
}
