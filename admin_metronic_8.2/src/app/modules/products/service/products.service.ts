import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../../auth';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  private headers() {
    return new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('token') });
  }

  configProducts() {
    const URL = URL_SERVICIOS + '/admin/products/config';
    return this.http.get(URL, { headers: this.headers() });
  }

  listProducts(page: number = 1, search: string = '') {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/products?page=' + page + '&search=' + search;
    return this.http.get(URL, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  createProduct(data: any) {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/products';
    return this.http.post(URL, data, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  showProduct(id: any) {
    const URL = URL_SERVICIOS + '/admin/products/' + id;
    return this.http.get(URL, { headers: this.headers() });
  }

  updateProduct(id: any, data: any) {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/products/' + id;
    return this.http.post(URL, data, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteProduct(id: any) {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/products/' + id;
    return this.http.delete(URL, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteImage(id: any) {
    const URL = URL_SERVICIOS + '/admin/products/image/' + id;
    return this.http.delete(URL, { headers: this.headers() });
  }
}
