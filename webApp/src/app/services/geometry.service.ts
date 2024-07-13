
//pour les couches that i drew
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeometryService {
  private apiUrl = 'http://localhost:3000/data/geometry';

  constructor(private http: HttpClient) { }

  saveGeometry(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
