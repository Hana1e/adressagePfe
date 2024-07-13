import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class GeometryService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  getGeometries(): Observable<L.Layer[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recensement/geometry`).pipe(
      map(items => items.map(item => {
        try {
          const geoJSON = typeof item.geoJSON === 'string' ? JSON.parse(item.geoJSON) : item.geoJSON;
          return L.geoJSON(geoJSON);
        } catch (error) {
          console.error('Error parsing GeoJSON string:', error);
          throw new Error('Invalid GeoJSON format');
        }
      }))
    );
  }
}
