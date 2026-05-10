
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface RetailerProduct {
  id?: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
}

export interface RetailerProfile {
  id?: string;
  storeName: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

@Injectable({ providedIn: 'root' })
export class RetailerService {

  private base = 'http://localhost:5000/api/Retailer';

  private productsSubject = new BehaviorSubject<RetailerProduct[]>([]);
  public products$ = this.productsSubject.asObservable();

  private profileSubject = new BehaviorSubject<RetailerProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  createProduct(data: RetailerProduct): Observable<RetailerProduct> {
    return this.http.post<RetailerProduct>(`${this.base}/create`, data).pipe(
      tap(newProduct => {
        const currentProducts = this.productsSubject.value;
        this.productsSubject.next([...currentProducts, newProduct]);
      })
    );
  }

  getProducts(): Observable<RetailerProduct[]> {
    return this.http.get<RetailerProduct[]>(`${this.base}/Get`).pipe(
      tap(products => this.productsSubject.next(products))
    );
  }

  deleteProduct(productId: string | number): Observable<any> {
    return this.http.delete(`${this.base}/Delete/${productId}`).pipe(
      tap(() => {
        const currentProducts = this.productsSubject.value.filter(p => p.id !== productId);
        this.productsSubject.next(currentProducts);
      })
    );
  }

  updateProduct(id: string | number, data: RetailerProduct): Observable<RetailerProduct> {
    return this.http.put<RetailerProduct>(`${this.base}/Update/${id}`, data).pipe(
      tap(updatedProduct => {
        const currentProducts = this.productsSubject.value.map(p =>
          p.id === id ? updatedProduct : p
        );
        this.productsSubject.next(currentProducts);
      })
    );
  }

  updateProfile(data: RetailerProfile): Observable<RetailerProfile> {
    return this.http.put<RetailerProfile>(`${this.base}/profile`, data).pipe(
      tap(updatedProfile => this.profileSubject.next(updatedProfile))
    );
  }

  viewProfile(): Observable<RetailerProfile> {
    return this.http.get<RetailerProfile>(`${this.base}/viewProfile`).pipe(
      tap(profile => this.profileSubject.next(profile))
    );
  }

  getLocalProducts(): RetailerProduct[] {
    return this.productsSubject.value;
  }

  getLocalProfile(): RetailerProfile | null {
    return this.profileSubject.value;
  }
}


