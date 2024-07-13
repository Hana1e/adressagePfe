import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { Injectable } from '@angular/core';
import { LayerManagementService } from './layer-management.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PolylineDrawingService {
  constructor(private alertCtrl: AlertController, private layerManagementService: LayerManagementService) {}

  async showOutOfBoundsAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Action non autorisée',
      message: 'Vous ne pouvez pas dessiner en dehors de votre zone attribuée.',
      buttons: ['OK']
    });
  
    await alert.present();
  }
  
  drawPolyline(map: L.Map, drawnItems: L.FeatureGroup, onClickCallback: (polyline: L.Polyline, e: L.LeafletMouseEvent) => void): L.Polyline {
    const polyline = L.polyline([], { color: 'blue' }).addTo(drawnItems);
  
    map.on('click', async (e: L.LeafletMouseEvent) => {
      if (!this.layerManagementService.attributedZone || !this.layerManagementService.attributedZone.features) {
        console.error("Attributed zone is not loaded or invalid:", this.layerManagementService.attributedZone);
        return;
      }

      if (this.isInsideZone(e.latlng)) {
        polyline.addLatLng(e.latlng);
      } else {
        await this.showOutOfBoundsAlert();
      }
    });
  
    polyline.on('click', (e: L.LeafletMouseEvent) => {
      e.originalEvent.stopPropagation();
      if (onClickCallback) onClickCallback(polyline, e);
    });
  
    return polyline;
  }

  private isInsideZone(latlng: L.LatLng): boolean {
    const point = turf.point([latlng.lng, latlng.lat]);
    for (const feature of this.layerManagementService.attributedZone.features) {
      if (turf.booleanPointInPolygon(point, feature)) {
        return true;
      }
    }
    return false;
  }
}
