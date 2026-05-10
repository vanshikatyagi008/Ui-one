import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface CustomerProfile {
  id?: string;
  username?: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  profileImage?: string;
}

export interface CartItem {
  id?: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  date?: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  shippingAddress?: string;
}

export interface Wishlist {
  id?: string;
  productId: string;
  productName: string;
  price: number;
  imageUrl?: string;
  addedDate?: string;
}

export interface ReviewData {
  productId: string;
  rating: number;
  comment: string;
  title: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {

  private base = 'http://localhost:5000/api/Customer';

  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  private wishlistSubject = new BehaviorSubject<Wishlist[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  private profileSubject = new BehaviorSubject<CustomerProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Profile Methods
  getProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.base}/Profile`).pipe(
      tap(profile => this.profileSubject.next(profile))
    );
  }

  updateProfile(data: CustomerProfile): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(`${this.base}/Profile`, data).pipe(
      tap(updatedProfile => this.profileSubject.next(updatedProfile))
    );
  }

  // Cart Methods
  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.base}/Cart`).pipe(
      tap(items => this.cartSubject.next(items))
    );
  }

  addToCart(item: CartItem): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.base}/Cart`, item).pipe(
      tap(newItem => {
        const currentCart = this.cartSubject.value;
        this.cartSubject.next([...currentCart, newItem]);
      })
    );
  }

  updateCartItem(itemId: string, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.base}/Cart/${itemId}`, { quantity }).pipe(
      tap(updatedItem => {
        const currentCart = this.cartSubject.value.map(item =>
          item.id === itemId ? updatedItem : item
        );
        this.cartSubject.next(currentCart);
      })
    );
  }

  removeFromCart(itemId: string): Observable<any> {
    return this.http.delete(`${this.base}/Cart/${itemId}`).pipe(
      tap(() => {
        const currentCart = this.cartSubject.value.filter(item => item.id !== itemId);
        this.cartSubject.next(currentCart);
      })
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.base}/Cart`).pipe(
      tap(() => this.cartSubject.next([]))
    );
  }

  // Order Methods
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/Orders`).pipe(
      tap(orders => this.ordersSubject.next(orders))
    );
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/Orders/${orderId}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.base}/Orders`, order).pipe(
      tap(newOrder => {
        const currentOrders = this.ordersSubject.value;
        this.ordersSubject.next([...currentOrders, newOrder]);
      })
    );
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http.put(`${this.base}/Orders/${orderId}/cancel`, {});
  }

  // Wishlist Methods
  getWishlist(): Observable<Wishlist[]> {
    return this.http.get<Wishlist[]>(`${this.base}/Wishlist`).pipe(
      tap(items => this.wishlistSubject.next(items))
    );
  }

  addToWishlist(item: Wishlist): Observable<Wishlist> {
    return this.http.post<Wishlist>(`${this.base}/Wishlist`, item).pipe(
      tap(newItem => {
        const currentWishlist = this.wishlistSubject.value;
        this.wishlistSubject.next([...currentWishlist, newItem]);
      })
    );
  }

  removeFromWishlist(itemId: string): Observable<any> {
    return this.http.delete(`${this.base}/Wishlist/${itemId}`).pipe(
      tap(() => {
        const currentWishlist = this.wishlistSubject.value.filter(item => item.id !== itemId);
        this.wishlistSubject.next(currentWishlist);
      })
    );
  }

  // Review Methods
  submitReview(data: ReviewData): Observable<any> {
    return this.http.post(`${this.base}/Reviews`, data);
  }

  getReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/Reviews`);
  }

  // Local Methods
  getLocalCart(): CartItem[] {
    return this.cartSubject.value;
  }

  getLocalOrders(): Order[] {
    return this.ordersSubject.value;
  }

  getLocalWishlist(): Wishlist[] {
    return this.wishlistSubject.value;
  }

  getLocalProfile(): CustomerProfile | null {
    return this.profileSubject.value;
  }
}
