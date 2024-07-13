import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }
  getQuartiersByUserId(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/recensement/quartiers/${userId}`).pipe(
      catchError(this.handleError)
    );
  }
  getVoiesDetailsByUserId(userId: string): Observable<{ totalQuartiers: number, voiesDetails: { quartier: string, voies: { adresse: string }[] }[] }> {
    return this.http.get<{ totalQuartiers: number, voiesDetails: { quartier: string, voies: { adresse: string }[] }[] }>(`${this.apiUrl}/recensement/voies-details/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse) {
    if (error.status === 400) {
      // Handle 400 error
      return throwError(() => new Error(error.error.message));
    } else {
      // Handle other errors
      return throwError(() => new Error('Something bad happened; please try again later.'));
    }
  }

  
}
