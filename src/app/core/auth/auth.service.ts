import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, CurrentUser, LoginRequest } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'taskhub_token';

  public currentUser = signal<CurrentUser | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  public login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', request).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        this.currentUser.set(response.user);
      }),
    );
  }

  public me(): Observable<CurrentUser> {
    return this.http
      .get<CurrentUser>('/api/auth/me')
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  public initCurrentUser(): void {
    if (!this.getToken()) {
      this.currentUser.set(null);
      return;
    }

    this.me().subscribe({
      error: () => this.logout(),
    });
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
