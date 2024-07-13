import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) { }

  // pour envoyer les données de formulaire au backend (ajouter user)
  addUser(userData: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.apiUrl}/users/signup`, userData, { headers })
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  

  // Methode pour récupérer tous users
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/allUsers`)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  
  

  deleteUser(id: string): Observable<any> {
    const url = `${this.apiUrl}/users/${id}`;
    return this.http.delete<any>(url);
  }

  findById(id: string): Observable<any> {
    const url = `${this.apiUrl}/users/${id}`;
    return this.http.get<any>(url);
  }
  updateUser(id: string, userData: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
  
    return this.http.put<any>(`${this.apiUrl}/users/${id}`, userData, { headers })
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  
}