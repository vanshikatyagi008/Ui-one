import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private tokenService: TokenService) {}

  canActivate(): boolean {
  const token = localStorage.getItem('token');

  if (token) {
    return true; // ✅ ALLOW NAVIGATION
  }

  this.router.navigate(['/login']);
  return false;
}}
