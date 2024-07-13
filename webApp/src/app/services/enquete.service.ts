import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EnqueteService {
  private apiUrl = 'http://localhost:3000/enquetes';

  constructor(private http: HttpClient) { }

  createEnquete(enqueteData: any) {
    return this.http.post(this.apiUrl, enqueteData);
  }
  getEnquetes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }
  deleteEnquete(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url).pipe(
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

  getQuartiersByUserId(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/quartiers/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  
}

