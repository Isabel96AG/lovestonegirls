import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({ providedIn: 'root' })
export class NewsletterService {

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  private headers() {
    return new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('token') });
  }

  listSubscribers(page: number = 1, search: string = '') {
    this.isLoadingSubject.next(true);
    const URL = `${URL_SERVICIOS}/admin/newsletter?page=${page}&search=${search}`;
    return this.http.get(URL, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteSubscriber(id: number) {
    this.isLoadingSubject.next(true);
    const URL = `${URL_SERVICIOS}/admin/newsletter/${id}`;
    return this.http.delete(URL, { headers: this.headers() }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
