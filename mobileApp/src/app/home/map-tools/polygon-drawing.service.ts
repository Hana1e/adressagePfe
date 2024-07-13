import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { Injectable } from '@angular/core';
import { LayerManagementService } from './layer-management.service';  
import { AlertController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class PolygonDrawingService {
  constructor(private alertCtrl: AlertController,private layerManagementService: LayerManagementService) {}

  async showOutOfBoundsAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Action non autorisée',
      message: 'Vous ne pouvez pas collecter les données en dehors de votre zone.',
      buttons: ['OK']
    });
  
    await alert.present();
  }
  
  drawPolygon(map: L.Map, drawnItems: L.FeatureGroup, onClickCallback: (polygon: L.Polygon, e: L.LeafletMouseEvent) => void): L.Polygon {
    const polygon = L.polygon([], { color: 'yellow' }).addTo(drawnItems);
  
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (!this.layerManagementService.attributedZone || !this.layerManagementService.attributedZone.features) {
        console.error("Attributed zone is not loaded or invalid:", this.layerManagementService.attributedZone);
        return;
      }
  
      const point = turf.point([e.latlng.lng, e.latlng.lat]);
      let isInsideAnyPolygon = false;
  
      for (const feature of this.layerManagementService.attributedZone.features) {
        if (turf.booleanPointInPolygon(point, feature)) {
          isInsideAnyPolygon = true;
          break;
        }
      }
  
      if (isInsideAnyPolygon) {
        polygon.addLatLng(e.latlng);
      } else {
        this.showOutOfBoundsAlert();
      }
    });
  
    polygon.on('click', (e: L.LeafletMouseEvent) => {
      e.originalEvent.stopPropagation();
      if (onClickCallback) onClickCallback(polygon, e);
    });
  
    return polygon;
  }

 
  
}
