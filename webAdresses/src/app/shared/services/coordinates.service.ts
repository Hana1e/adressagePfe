import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CoordinatesService {
  private coordinatesSubject = new BehaviorSubject<{ lat: number, lng: number }>({ lat: 0, lng: 0 });
  coordinates$ = this.coordinatesSubject.asObservable();

  constructor(private http: HttpClient) {}

  setCoordinates(coordinates: { lat: number, lng: number }) {
    this.coordinatesSubject.next(coordinates);
  }

  
}
