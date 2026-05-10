import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  role: 'Customer' | 'Retailer' = 'Customer';
  errorMsg = '';
  successMsg = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.username || !this.email || !this.password || !this.role) {
      this.errorMsg = 'All fields are required';
      return;
    }

    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMsg = 'Invalid email format';
      return;
    }

    this.loading = true;

    const registerData: RegisterRequest = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.successMsg = 'Registration successful! Redirecting...';
        setTimeout(() => {
          if (this.role === 'Retailer') {
            this.router.navigate(['/retailer']);
          } else {
            this.router.navigate(['/customer']);
          }
        }, 1500);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}