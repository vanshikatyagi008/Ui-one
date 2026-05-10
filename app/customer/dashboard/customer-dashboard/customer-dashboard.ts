import { Component, OnInit } from '@angular/core';
import { CustomerService, CustomerProfile, CartItem, Order, Wishlist } from '../../../services/customer.service';
import { AuthService } from '../../../services/auth.service';
import { TokenService } from '../../../services/token.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.css']
})
export class CustomerDashboard implements OnInit {

  activeTab: 'dashboard' | 'orders' | 'cart' | 'wishlist' | 'profile' = 'dashboard';
  customerName: string = '';
  profile: CustomerProfile | null = null;
  orders: Order[] = [];
  cart: CartItem[] = [];
  wishlist: Wishlist[] = [];
  loading = false;
  showEditProfile = false;

  profileForm: CustomerProfile = {
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  };

  errorMsg = '';
  successMsg = '';
  
  stats = {
    totalOrders: 0,
    totalSpent: 0,
    cartItems: 0,
    wishlistItems: 0
  };

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerName = this.tokenService.getUsername() || 'Customer';
    this.loadProfile();
    this.loadOrders();
    this.loadCart();
    this.loadWishlist();
  }

  loadProfile(): void {
    this.loading = true;
    this.customerService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm = { ...profile };
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  loadOrders(): void {
    this.customerService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.stats.totalOrders = orders.length;
        this.stats.totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      },
      error: () => {
        this.errorMsg = 'Failed to load orders';
      }
    });
  }

  loadCart(): void {
    this.customerService.getCart().subscribe({
      next: (items) => {
        this.cart = items;
        this.stats.cartItems = items.length;
      },
      error: () => {
        this.errorMsg = 'Failed to load cart';
      }
    });
  }

  loadWishlist(): void {
    this.customerService.getWishlist().subscribe({
      next: (items) => {
        this.wishlist = items;
        this.stats.wishlistItems = items.length;
      },
      error: () => {
        this.errorMsg = 'Failed to load wishlist';
      }
    });
  }

  updateProfile(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.profileForm.phone || !this.profileForm.address) {
      this.errorMsg = 'Please fill required fields';
      return;
    }

    this.loading = true;
    this.customerService.updateProfile(this.profileForm).subscribe({
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

  updateCartQuantity(itemId: string | undefined, quantity: number): void {
    if (!itemId || quantity <= 0) return;

    this.customerService.updateCartItem(itemId, quantity).subscribe({
      next: () => {
        this.successMsg = 'Cart updated!';
        this.loadCart();
      },
      error: () => {
        this.errorMsg = 'Failed to update cart';
      }
    });
  }

  removeFromCart(itemId: string | undefined): void {
    if (!itemId) return;

    this.customerService.removeFromCart(itemId).subscribe({
      next: () => {
        this.successMsg = 'Item removed from cart!';
        this.loadCart();
      },
      error: () => {
        this.errorMsg = 'Failed to remove item';
      }
    });
  }

  removeFromWishlist(itemId: string | undefined): void {
    if (!itemId) return;

    this.customerService.removeFromWishlist(itemId).subscribe({
      next: () => {
        this.successMsg = 'Item removed from wishlist!';
        this.loadWishlist();
      },
      error: () => {
        this.errorMsg = 'Failed to remove item';
      }
    });
  }

  checkout(): void {
    if (this.cart.length === 0) {
      this.errorMsg = 'Your cart is empty!';
      return;
    }

    const order: Order = {
      totalAmount: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'Pending',
      items: this.cart,
      shippingAddress: `${this.profileForm.address}, ${this.profileForm.city}, ${this.profileForm.state} ${this.profileForm.zipCode}`
    };

    this.loading = true;
    this.customerService.createOrder(order).subscribe({
      next: () => {
        this.successMsg = 'Order placed successfully!';
        this.customerService.clearCart().subscribe(() => {
          this.loadCart();
          this.loadOrders();
        });
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to place order';
        this.loading = false;
      }
    });
  }

  cancelOrder(orderId: string | undefined): void {
    if (!orderId) return;

    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.customerService.cancelOrder(orderId).subscribe({
      next: () => {
        this.successMsg = 'Order cancelled successfully!';
        this.loadOrders();
      },
      error: () => {
        this.errorMsg = 'Failed to cancel order';
      }
    });
  }

  getOrderStatusColor(status: string): string {
    switch (status) {
      case 'Delivered':
        return '#10b981';
      case 'Shipped':
        return '#3b82f6';
      case 'Processing':
        return '#f59e0b';
      case 'Pending':
        return '#9ca3af';
      case 'Cancelled':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  }

  calculateCartTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  switchTab(tab: 'dashboard' | 'orders' | 'cart' | 'wishlist' | 'profile'): void {
    this.activeTab = tab;
    this.errorMsg = '';
    this.successMsg = '';
  }
}
