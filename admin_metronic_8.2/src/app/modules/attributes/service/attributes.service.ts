import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../../auth';

@Injectable({
  providedIn: 'root'
})
export class AttributesService {

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    public authservice: AuthService,
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  private headers() {
    return new HttpHeaders({ 'Authorization': 'Bearer ' + this.authservice.token });
  }

  listAttributes(page: number = 1, search: string = '') {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/attributes?page=' + page + '&search=' + search;
    return this.http.get(URL, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  createAttribute(data: any) {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/attributes';
    return this.http.post(URL, data, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateAttribute(attribute_id: string, data: any) {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/attributes/' + attribute_id;
    return this.http.post(URL, data, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteAttribute(attribute_id: any) {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/attributes/' + attribute_id;
    return this.http.delete(URL, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  createProperty(data: any) {
    const URL = URL_SERVICIOS + '/admin/properties';
    return this.http.post(URL, data, { headers: this.headers() });
  }

  deleteProperty(propertie_id: any) {
    const URL = URL_SERVICIOS + '/admin/properties/' + propertie_id;
    return this.http.delete(URL, { headers: this.headers() });
  }
}
