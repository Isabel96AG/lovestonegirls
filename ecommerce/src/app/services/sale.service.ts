import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  constructor(private http: HttpClient) {}

  // cabecera con el token JWT para rutas protegidas
  private headers() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  // crear un nuevo pedido enviando los datos del checkout
  createSale(data: any) {
    return this.http.post(URL_SERVICIOS + '/ecommerce/sales', data, { headers: this.headers() });
  }

  // obtener todos los pedidos del usuario
  getSales() {
    return this.http.get(URL_SERVICIOS + '/ecommerce/sales', { headers: this.headers() });
  }

  // ver el detalle de un pedido concreto
  getSale(id: number) {
    return this.http.get(URL_SERVICIOS + '/ecommerce/sales/' + id, { headers: this.headers() });
  }
}
