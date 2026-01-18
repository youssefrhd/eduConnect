import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { response } from 'express';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  private userKey = 'learnhub_user';
  private tokenKey = 'learnhub_token';
  private API = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage(); 
  }

  
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.userKey);
    const token = localStorage.getItem(this.tokenKey);
    
    if (userStr && token) {
      try {
        const user: User = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('✅ User loaded from localStorage:', user.name);
      } catch (error) {
        console.error('❌ Error parsing user from localStorage:', error);
        this.clearAuthData();
      }
    } else {
      console.log('ℹ️ No stored user found');
    }
  }

  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  
  getCurrentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            
            const user: User = {
              userId:response.userId,
              name: response.name || email.split('@')[0],
              email: response.email || email,
              role: response.role || 'student',
              token: response.token
            };
            
            
            localStorage.setItem(this.userKey, JSON.stringify(user));
            localStorage.setItem(this.tokenKey, response.token);
            
            
            localStorage.setItem('email', String(user.userId));
            localStorage.setItem('email', user.email);
            localStorage.setItem('name', user.name);
            localStorage.setItem('role', user.role);
            localStorage.setItem('access_token', response.token);
            
            
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
            
            console.log('✅ Login successful:', user.name);
            this.router.navigate(['/file-manager']);
          }
        })
      );
  }

register(email: string, name: string, password: string, birthday: Date): Observable<string> {
  return this.http.post(
    `${this.API}/register`, 
    { email, name, password, birthday },
    { responseType: 'text' }  
  ).pipe(
    tap((response: string) => {
      console.log("Registration response:", response);
      
    
      if (response && response.includes('Check your email')) {
        this.router.navigate(['/check-email'], {
          queryParams: { email: email }
        });
      }
    })
  );
}

 
  verifyEmail(token: string): Observable<any> {
  return this.http.get(`${this.API}/verify-email`, {
    params: { token },
  });
}

resendVerification(email: string): Observable<any> {
  return this.http.post(`${this.API}/resend-email`, null, {
    params: { email }
  });
}
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    
    return localStorage.getItem(this.tokenKey) || localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    const hasToken = !!this.getToken();
    const hasUser = !!this.currentUserSubject.value;
    const isAuth = this.isAuthenticatedSubject.value;
    
    const result = hasToken && hasUser && isAuth;
    console.log('🔐 isLoggedIn check:', { hasToken, hasUser, isAuth, result });
    
    return result;
  }

  getAuthState(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  
  private clearAuthData(): void {
    
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('access_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    console.log('✅ Auth data cleared');
  }

  
  updateUser(userData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser: User = { ...currentUser, ...userData };
      
      
      localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
      
      
      if (userData.name) localStorage.setItem('name', userData.name);
      if (userData.email) localStorage.setItem('email', userData.email);
      if (userData.role) localStorage.setItem('role', userData.role);
      
      
      this.currentUserSubject.next(updatedUser);
      
      console.log('✅ User updated:', updatedUser.name);
    }
  }
}

export interface AuthResponse {
  userId:string;
  token: string;
  email: string;
  role: string;
  name :string;
}
export interface User {
  userId:string;
  name: string;
  email: string;
  role: string;
  token?: string;
}