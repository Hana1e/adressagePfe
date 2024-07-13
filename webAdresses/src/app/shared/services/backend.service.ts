import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class BackendService {
    private apiUrl = 'http://localhost:3000'; // Remplacez par l'URL de votre API
  
    constructor(private http: HttpClient) {}
  
    checkIntersection(lat: number, lng: number): Observable<{ adresseImmeuble: string }> {
      return this.http.get<{ adresseImmeuble: string }>(`${this.apiUrl}/recensement/checkIntersection/${lat}/${lng}`);
    }
    checkIntersectionPolyline(lat: number, lng: number): Observable<{ adresse?: string }> {
      return this.http.get<{ adresse?: string }>(`${this.apiUrl}/recensement/polyline/checkIntersection/${lat}/${lng}`);
    }
  }
  