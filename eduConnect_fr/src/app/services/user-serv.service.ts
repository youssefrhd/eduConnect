import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';

@Injectable({
  providedIn: 'root',
})
export class UserServService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthentificated = new BehaviorSubject<boolean>(false);

  private API = 'http://localhost:8080/profile';
  constructor(private http: HttpClient) {
    this.loadUser();
  }

  
  getCurrentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  private loadUser(): void {
    this.http.get<User|null>(`${this.API}/me`).subscribe((response) => {
        if (response) {
          const user: User = {
            userId: response.userId,
            name: response.name,
            email: response.email,
            role: response.role,
            token: response.token,
            city: response.city,
            bio: response.bio,
            picture: response.picture,
            createdAt: response.createdAt,
            birthday: response.birthday,
            password: response.password,
            handynummer: response.handynummer,
          };
          console.log("the user loaded successfully !!"+user.email);
          this.currentUserSubject.next(user);
          this.isAuthentificated.next(true);
        }
      })
  }
}
