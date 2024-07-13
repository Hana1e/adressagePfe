import { Injectable } from '@angular/core';
import { Geolocation, PositionOptions } from '@capacitor/geolocation';
import { Observable, Observer } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  async getCurrentPosition(): Promise<any> {
    try {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      
      const coordinates = await Geolocation.getCurrentPosition(options);
      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }


  watchPosition(callback: (position: { latitude: number; longitude: number; }) => void, errorCallback?: (error: any) => void) {
    const options = {
      enableHighAccuracy: true, 
      maximumAge: 0,
      timeout: 5000 
    };
  
    const watchId = Geolocation.watchPosition(options, (position, err) => {
      if (err) {
        errorCallback?.(err);
        return;
      }
      if (position) {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      }
    });
  
    return watchId;
  }

  clearWatch(watchId: string): void {
    Geolocation.clearWatch({ id: watchId });
  }
}
