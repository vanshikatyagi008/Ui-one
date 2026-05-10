import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TokenService } from './token.service';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'Customer' | 'Retailer';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  message: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private base = 'http://localhost:5000/api/Auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    if (this.tokenService.hasToken() && !this.tokenService.isTokenExpired()) {
      this.isAuthenticatedSubject.next(true);
      this.userRoleSubject.next(this.tokenService.getUserRole());
    } else {
      this.tokenService.clearToken();
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/Register`, data).pipe(
      tap(response => {
        this.tokenService.setToken(response.token);
        this.tokenService.setUserRole(response.role);
        this.tokenService.setUsername(response.username);
        this.isAuthenticatedSubject.next(true);
        this.userRoleSubject.next(response.role);
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/Login`, data).pipe(
      tap(response => {
        this.tokenService.setToken(response.token);
        this.tokenService.setUserRole(response.role);
        this.tokenService.setUsername(response.username);
        this.isAuthenticatedSubject.next(true);
        this.userRoleSubject.next(response.role);
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.base}/ChangePass`, data);
  }

  getUserName(): Observable<any> {
    return this.http.get(`${this.base}/UserName`);
  }

  logout(): void {
    this.tokenService.clearToken();
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUserRole(): string | null {
    return this.tokenService.getUserRole();
  }

  getCurrentUsername(): string | null {
    return this.tokenService.getUsername();
  }

  saveSession(res: any) {
    this.tokenService.setToken(res.token);
    this.tokenService.setUserRole(res.role);
  }

  getRole(): string {
    return this.tokenService.getUserRole() || '';
  }
}
