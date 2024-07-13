import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecensementService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient,private authService: AuthService) { }
  
  sendPolylineData(geoJSON: any, nomOfficiel: string, nomUsage: string, typedevoie: string, numeroVoie: string, statut: string, userId: string, distanceWithUnit: string, nomQuartier: string, quartierId: string, adresse: string): Observable<any> {
    const body = {
      geoJSON: geoJSON,
      nomOfficiel: nomOfficiel,
      nomUsage: nomUsage,
      typedevoie: typedevoie,
      numeroVoie: numeroVoie,
      statut: statut,
      distance: distanceWithUnit,
      createdBy: userId,
      nomQuartier: nomQuartier,
      quartierId: quartierId, // Assurez-vous que quartierId est envoyé correctement
      adresse: adresse // Ajoutez l'adresse
    };

    return this.http.post<any>(`${this.apiUrl}/recensement/polyline`, body);
}


  
  sendPolygonData(geoJSON: any, nomEntite: string, userId: string, areaWithUnit: string,layerId:string, nomQuartier?: string, typeImmeuble?: string, nomImmeuble?: string,Quartier?:string,typeQuartier?:string,nombreEtages?:number,description?: string, adresseImmeuble?: string,codePostal?: number, codePostalQuartier?: number ): Observable<any> {
    if (nomQuartier) {
      nomQuartier = `Hay ${nomQuartier.toUpperCase()}`;
    }
    return this.http.post<any>(`${this.apiUrl}/recensement/polygon`, {
        geoJSON: geoJSON,
        nomEntite: nomEntite,
        createdBy: userId,
        area: areaWithUnit,
        nomQuartier: nomQuartier,
        typeImmeuble: typeImmeuble,
        nomImmeuble: nomImmeuble,
        Quartier:Quartier,
        typeQuartier,
        nombreEtages,
        layerId: layerId ,
        description: description,
        adresseImmeuble: adresseImmeuble,
        codePostal: codePostal,
        codePostalQuartier:codePostalQuartier
    });
}

getCodePostalQuartier(quartierId: string): Observable<number | undefined> {
  
  return this.http.get<number | undefined>(`${this.apiUrl}/recensement/${quartierId}/code-postal`);
}
getReferencePointByAddress(address: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/recensement/polyline/address/${address}/reference-point`).pipe(
    catchError(this.handleError)
  );
}
doesAddressWithSameDistanceExist(address: string, distance: number): Observable<{ exists: boolean }> {
  const params = { address, distance: distance.toString() };
  return this.http.get<{ exists: boolean }>(`${this.apiUrl}/recensement/address-exists`, { params }).pipe(
    catchError(this.handleError)
  );
}

private handleError(error: HttpErrorResponse) {
  console.error('An error occurred:', error);
  return throwError('Something bad happened; please try again later.');
}

addFinalAddressImmeuble(polygonId: string, adresseFinalImmeuble: string, distance: number, rive?: string, sequentialNumber?: number): Observable<any> {
  // Définir un type générique pour le corps de la requête
  type RequestBody = { adresseFinalImmeuble: string; distance: number; rive?: string ;sequentialNumber?: number;};

  // Construire le corps de la requête
  const requestBody: RequestBody = { adresseFinalImmeuble, distance };
  if (rive) {
    requestBody.rive = rive;
  }
  if (sequentialNumber !== undefined) {
    requestBody.sequentialNumber = sequentialNumber;
  }

  // Effectuer la requête HTTP
  return this.http.post<any>(`${this.apiUrl}/recensement/add-final-address/${polygonId}`, requestBody);
}


addReferencePointToPolyline(polylineId: string, referencePoint: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/recensement/polyline/${polylineId}/reference-point`, referencePoint).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 400 && error.error === 'Polyline already has a reference point') {
        return throwError('Polyline already has a reference point');
      }
      return throwError('Failed to add reference point to polyline');
    })
  );
}

getPolylineReferencePoint(polylineId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/recensement/polyline/${polylineId}/reference-point`);
}
getPolylineReferenceStatus(polylineId: string): Observable<string> {
  return this.http.get<string>(`${this.apiUrl}/recensement/polyline/${polylineId}/reference-status`);
}


getImmeubleAddresses(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/recensement/immeuble-addresses`);
}
  
  //pour recuper nom des quartiers 
    getQuartiers(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/recensement/quartiers`);
    }
    //pour geom de quartiers 
    getQuartierGeometries(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/recensement/quartiers/geometries`);
  }

  

  

  //adress pour voie
  getAllAddresses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/recensement/allAddresses`);
  }
  getAddressGeometry(address: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recensement/polyline/address/${address}`);
  }
  
  
  
  getPolygonsByUserId(): Observable<any[]> {
    const userId = this.authService.getUserId();
    return this.http.get<any[]>(`${this.apiUrl}/recensement/geometrys/user/${userId}/polygon`);
  }
  
  getPolylinesByUserId(): Observable<any[]> {
    const userId = this.authService.getUserId();
    return this.http.get<any[]>(`${this.apiUrl}/recensement/geometrys/user/${userId}/polyline`);
  }
  
  getAddressFromPolygon(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recensement/immeuble-addresses/${id}`);
  }
  
  
  deleteGeometry(id: string, type: 'polyline' | 'polygon'): Observable<any> {
    let endpoint: string;
    
    // Déterminer l'endpoint en fonction du type de géométrie
    if (type === 'polyline') {
      endpoint = `recensement/polyline/${id}`;
    } else if (type === 'polygon') {
      endpoint = `recensement/polygon/${id}`;
    } else {
      console.error('Unknown geometry type');
      return new Observable(); // Retourner une observable vide pour les cas inconnus
    }

    return this.http.delete(`${this.apiUrl}/${endpoint}`);
  }
//adress pour voie mais par id click
  getAddressFromPolyline(polylineId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recensement/polyline/${polylineId}/address`);
  }

  getPolylineGeometry(polylineId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recensement/polyline/${polylineId}/geometry`);
  }

  getPolygonAttributes(polygonId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recensement/polygon/${polygonId}/attributes`);
  }


  getFinalAddressById(polygonId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recensement/immeuble-final-address/${polygonId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        throw new Error('Failed to fetch final address for immeuble');
      })
    );
  }
  
  //pour fetch layer attribue
  getCoucheAttribuee(): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.get<any>(`${this.apiUrl}/enquetes/couche/user/${userId}`);
  }
  getLayerData(layerId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/data/layer/${layerId}`);
  }

 
}
