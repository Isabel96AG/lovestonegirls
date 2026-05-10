import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../auth';

@Injectable({
  providedIn: 'root'
})
export class EstadisticsService {

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // llama al endpoint que devuelve todos los datos del dashboard de una vez
  getEstadistics() {
    this.isLoadingSubject.next(true);
    // leemos el token directamente de localStorage para asegurarnos de que está disponible
    let token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + token });
    let URL = URL_SERVICIOS + '/admin/estadistics';
    return this.http.get(URL, { headers: headers }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
