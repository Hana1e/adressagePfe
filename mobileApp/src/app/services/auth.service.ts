// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('authToken');
    this.isAuthenticated.next(!!token);
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string, userId: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userId', response.userId);  // Ensure this is set
        console.log('Logged in user ID:', response.userId);  // Check the logged user ID
        this.isAuthenticated.next(true);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of(null);
      })
    );
  }
  getToken() {
    return localStorage.getItem('authToken');
  }
  

  getUserId() {
    return localStorage.getItem('userId');
  }
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');  
    this.isAuthenticated.next(false);
    window.location.reload();   //to reset the state of app when i remove this it gives me geom of the wrong userId
  }

  isLoggedIn() {
    return this.isAuthenticated.asObservable();
  }

  isUserAuthenticated() {
    return this.isAuthenticated.value;
  }

  
}