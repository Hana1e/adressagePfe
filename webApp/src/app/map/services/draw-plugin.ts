import { Injectable } from '@angular/core';
import L from 'leaflet';
import 'leaflet-geometryutil';
import { area } from '@turf/turf';

@Injectable({
  providedIn: 'root'
})
export class DrawPluginService {
  constructor() { }

  drawPlugin(map: any) {
    const drawnItems = L.featureGroup().addTo(map);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        rectangle: false,
        circlemarker: false,
        marker: true,
        polyline: {
          metric: true 
        }
      }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
    
      if (layer instanceof L.Polyline) {
        this.updateDistance(layer); 
      } else if (layer instanceof L.Polygon) {
        const areaValue = this.calculateArea(layer);
        layer.bindPopup(`Area: ${areaValue.toFixed(2)} square meters`).openPopup(); 
      }
    
      drawnItems.addLayer(layer);
    });
    

    map.on(L.Draw.Event.EDITED, (event: any) => {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        if (layer instanceof L.Polyline) {
          this.updateDistance(layer); 
        }
      });
    });
  
  }

  private updateDistance(layer: L.Polyline): void {
    const distance = this.calculateDistance(layer);
    layer.bindPopup(`Distance: ${distance.toFixed(2)} meters`).openPopup();
  }
  

  private calculateDistance(layer: L.Layer): number {
    // Calculons la distance de la ligne
    const latLngs = (layer as L.Polyline).getLatLngs();
    let distance = 0;

    for (let i = 0; i < latLngs.length - 1; i++) {
      distance += latLngs[i].distanceTo(latLngs[i + 1]);
    }

    return distance;
  }

  private calculateArea(layer: L.Layer): number {
    
    const latLngs = (layer as L.Polygon).getLatLngs()[0];
    const coords = latLngs.map(latLng => [latLng.lng, latLng.lat]); 
    const polygonGeoJSON = { "type": "Polygon", "coordinates": [coords] };

  
    const areaValue = area(polygonGeoJSON);

    return areaValue;
  }
}