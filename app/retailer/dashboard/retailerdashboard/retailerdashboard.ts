import { Component, OnInit } from '@angular/core';
import { RetailerService, RetailerProduct, RetailerProfile } from '../../../services/retailer.service';
import { AuthService } from '../../../services/auth.service';
import { TokenService } from '../../../services/token.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-retailer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './retailerdashboard.html',
  styleUrls: ['./retailerdashboard.css']
})
export class Retailerdashboard implements OnInit {

  activeTab: 'dashboard' | 'products' | 'profile' = 'dashboard';
  retailerName: string = '';
  products: RetailerProduct[] = [];
  profile: RetailerProfile | null = null;
  loading = false;
  showAddProduct = false;
  showEditProfile = false;
  editingProductId: string | null = null;
  
  // Form models
  newProduct: RetailerProduct = {
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    imageUrl: '',
    category: ''
  };

  editProduct: RetailerProduct | null = null;
  
  profileForm: RetailerProfile = {
    storeName: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  };

  errorMsg = '';
  successMsg = '';
  stats = {
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0
  };

  constructor(
    private retailerService: RetailerService,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.retailerName = this.tokenService.getUsername() || 'Retailer';
    this.loadProfile();
    this.loadProducts();
  }

  loadProfile(): void {
    this.loading = true;
    this.retailerService.viewProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm = { ...profile };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.retailerService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.totalProducts = this.products.length;
    this.stats.totalValue = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    this.stats.lowStock = this.products.filter(p => p.quantity < 10).length;
  }

  addProduct(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.newProduct.name || this.newProduct.price <= 0 || this.newProduct.quantity < 0) {
      this.errorMsg = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.retailerService.createProduct(this.newProduct).subscribe({
      next: () => {
        this.successMsg = 'Product added successfully!';
        this.resetProductForm();
        this.showAddProduct = false;
        this.loadProducts();
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to add product';
        this.loading = false;
      }
    });
  }

  saveEditProduct(): void {
    if (!this.editProduct || !this.editingProductId) return;

    this.errorMsg = '';
    this.successMsg = '';

    if (!this.editProduct.name || this.editProduct.price <= 0) {
      this.errorMsg = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.retailerService.updateProduct(this.editingProductId, this.editProduct).subscribe({
      next: () => {
        this.successMsg = 'Product updated successfully!';
        this.editProduct = null;
        this.editingProductId = null;
        this.loadProducts();
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to update product';
        this.loading = false;
      }
    });
  }

  startEditProduct(product: RetailerProduct): void {
    this.editProduct = { ...product };
    this.editingProductId = product.id || null;
    this.activeTab = 'products';
  }

  deleteProduct(id: string | undefined): void {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this product?')) return;

    this.loading = true;
    this.retailerService.deleteProduct(id).subscribe({
      next: () => {
        this.successMsg = 'Product deleted successfully!';
        this.loadProducts();
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to delete product';
        this.loading = false;
      }
    });
  }

  updateProfile(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.profileForm.storeName || !this.profileForm.phone) {
      this.errorMsg = 'Please fill required fields';
      return;
    }

    this.loading = true;
    this.retailerService.updateProfile(this.profileForm).subscribe({
      next: () => {
        this.successMsg = 'Profile updated successfully!';
        this.showEditProfile = false;
        this.loadProfile();
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to update profile';
        this.loading = false;
      }
    });
  }

  resetProductForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      imageUrl: '',
      category: ''
    };
  }

  cancelEdit(): void {
    this.editProduct = null;
    this.editingProductId = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  switchTab(tab: 'dashboard' | 'products' | 'profile'): void {
    this.activeTab = tab;
    this.errorMsg = '';
    this.successMsg = '';
  }
}
