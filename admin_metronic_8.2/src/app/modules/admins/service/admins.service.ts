import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({ providedIn: 'root' })
export class AdminsService {

  constructor(private http: HttpClient) {}

  private headers() {
    return new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('token') });
  }

  listAdmins() {
    return this.http.get(`${URL_SERVICIOS}/admin/admins`, { headers: this.headers() });
  }

  createAdmin(data: any) {
    return this.http.post(`${URL_SERVICIOS}/admin/admins`, data, { headers: this.headers() });
  }

  deleteAdmin(id: number) {
    return this.http.delete(`${URL_SERVICIOS}/admin/admins/${id}`, { headers: this.headers() });
  }
}
