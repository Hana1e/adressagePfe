import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { RecensementService } from 'src/app/services/recensement.service';

@Injectable({
  providedIn: 'root'
})
export class LayerManagementService {
  private map: L.Map;
  private geoJSONLayer: L.GeoJSON;
  private isLayerVisible: boolean = false;
  public attributedZone: any = null;

  constructor(private http: HttpClient, private recensementService: RecensementService) {}

  setMap(map: L.Map) {
    this.map = map;
  }

  afficherIdCouche() {
    if (!this.map) {
      console.error("La carte n'est pas initialisée lors de la tentative d'affichage de la couche.");
      return;
    }
  
    this.recensementService.getCoucheAttribuee().subscribe({
      next: (data) => {
        console.log('ID de la couche attribuée:', data.layerId);
        this.toggleLayerVisibility(data.layerId);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'ID de la couche', err);
      }
    });
  }

  isLayerCurrentlyVisible(): boolean {
    return this.isLayerVisible;
  }

  private toggleLayerVisibility(layerId: string) {
    if (this.isLayerVisible && this.geoJSONLayer) {
      this.map.removeLayer(this.geoJSONLayer);
      this.isLayerVisible = false;
    } else {
      this.loadAndDisplayLayer(layerId);
    }
  }

  loadAndDisplayLayer(layerId: string) {
    this.recensementService.getLayerData(layerId).subscribe({
      next: (response) => {
        
        const geojsonData = response.data.geoJSON;
        this.attributedZone = geojsonData;  // Mise à jour de la zone attribuée
        if (this.geoJSONLayer) {
          this.map.removeLayer(this.geoJSONLayer);
        }
        // Définition des options de style pour la bordure de la couche GeoJSON
        const borderStyle = {
          color: 'red', // Couleur de la bordure
          weight: 2, // Épaisseur de la bordure
          fillOpacity: 0,
          opacity: 1 // Opacité de la bordure
          // Vous pouvez également ajouter d'autres propriétés de style si nécessaire
        };

        this.geoJSONLayer = L.geoJSON(geojsonData, {
          style: borderStyle // Définir les options de style pour la couche GeoJSON
        }).addTo(this.map);
        this.geoJSONLayer.bringToBack();
        this.map.fitBounds(this.geoJSONLayer.getBounds());
        this.isLayerVisible = true;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des données GeoJSON', err);
      }
    });
}

  hideAssignedLayer() {
    if (this.geoJSONLayer) {
      this.map.removeLayer(this.geoJSONLayer);
      this.isLayerVisible = false;
    }
  }

}
