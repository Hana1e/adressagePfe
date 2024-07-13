import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { RecensementService } from 'src/app/services/recensement.service';

@Injectable({
  providedIn: 'root'
})
export class QuartierService {
  isQuartiersVisible = false;
  private quartierLayers: { layer: L.Layer, initialColor: string }[] = [];
  private selectedLayer: L.Layer | null = null;

  constructor(private recensementService: RecensementService) { }

  toggleQuartiersVisibility(map: L.Map): void {
    if (this.isQuartiersVisible) {
      this.hideQuartiers(map);
    } else {
      this.showQuartiers(map);
    }
    this.isQuartiersVisible = !this.isQuartiersVisible;
  }

  showQuartiers(map: L.Map): void {
    this.quartierLayers = [];
    this.recensementService.getQuartierGeometries().subscribe(
      quartierGeometries => {
        quartierGeometries.forEach(quartierGeometry => {
          const layer = L.geoJSON(quartierGeometry.geoJSON, {
            style: { color: 'orange'},
          });

          layer.on('click', (e: L.LeafletMouseEvent) => {
            L.DomEvent.stop(e);
            this.handleQuartierClick(layer);
          });

          // Bind popup with quartier name
          const popupContent = `<b>${quartierGeometry.nomQuartier}</b>`;
          layer.bindPopup(popupContent);

          // Add the layer to the map and bring it to back
          layer.addTo(map);
          layer.bringToBack();

          this.quartierLayers.push({ layer: layer, initialColor: 'orange' });
        });

        // Ajouter un écouteur d'événements click à la carte pour réinitialiser la couleur des quartiers
        map.on('click', () => {
          this.resetQuartierColors();
        });
      },
      error => {
        console.error('Failed to load quartier geometries:', error);
      }
    );
  }

  resetQuartierColors(): void {
    this.quartierLayers.forEach(item => {
      (item.layer as L.Path).setStyle({ color: item.initialColor });
    });
  }

  

  hideQuartiers(map: L.Map): void {
    this.quartierLayers.forEach(item => {
      map.removeLayer(item.layer);
    });
  }

  handleQuartierClick(layer: L.Layer): void {
    // Remove selection from other layers
    this.quartierLayers.forEach(item => {
      (item.layer as L.Path).setStyle({ color: item.initialColor });
    });

    // Change color of clicked layer
    (layer as L.Path).setStyle({ color: 'red' });

    // Update selected layer
    this.selectedLayer = layer;
  }

  handleGeometryClick(layer: L.Layer, geometryId: string): void {
    // Reset color of selected layer
    if (this.selectedLayer) {
      this.quartierLayers.forEach(item => {
        if (item.layer === this.selectedLayer) {
          (item.layer as L.Path).setStyle({ color: item.initialColor });
        }
      });
      this.selectedLayer = null;
    }

    // Handle click on geometry
    // Example: highlight or show details
  }
}
