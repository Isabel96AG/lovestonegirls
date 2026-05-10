import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class EcommerceService {

  constructor(private http: HttpClient) { }

  getHome() {
    return this.http.get(URL_SERVICIOS + '/ecommerce/home');
  }

  getCategories() {
    return this.http.get(URL_SERVICIOS + '/ecommerce/categories');
  }

  getProducts(page: number = 1, search: string = '', categorie_id: any = '') {
    let url = URL_SERVICIOS + '/ecommerce/products?page=' + page + '&search=' + search;
    if (categorie_id) url += '&categorie_id=' + categorie_id;
    return this.http.get(url);
  }

  getProduct(slug: string) {
    return this.http.get(URL_SERVICIOS + '/ecommerce/product/' + slug);
  }
}
