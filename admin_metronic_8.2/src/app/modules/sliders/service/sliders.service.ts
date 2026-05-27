import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../../auth';

@Injectable({
  providedIn: 'root'
})
export class SlidersService {

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

  listSliders() {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/sliders';
    return this.http.get(URL, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  createSlider(data: any) {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/sliders';
    return this.http.post(URL, data, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  showSlider(id: any) {
    const URL = URL_SERVICIOS + '/admin/sliders/' + id;
    return this.http.get(URL, { headers: this.headers() });
  }

  updateSlider(id: any, data: any) {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/sliders/' + id;
    return this.http.post(URL, data, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteSlider(id: any) {
    this.isLoadingSubject.next(true);
    const URL = URL_SERVICIOS + '/admin/sliders/' + id;
    return this.http.delete(URL, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
