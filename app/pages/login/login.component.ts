import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  errorMsg = '';
  successMsg = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.email || !this.password) {
      this.errorMsg = 'Username and Password are required';
      return;
    }

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.loading = true;

    this.authService.login(loginData).subscribe({
      next: (res) => {
        this.successMsg = 'Login successful!';

          if (res.role === 'Retailer') {
            this.router.navigate(['/retailer']);
          } else {
            this.router.navigate(['/customer']);
          }
        
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Invalid credentials';
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
