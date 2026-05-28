import { Component, OnInit } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NewsletterService } from '../service/newsletter.service';

@Component({
  selector: 'app-list-newsletter',
  templateUrl: './list-newsletter.component.html',
  styleUrls: ['./list-newsletter.component.scss']
})
export class ListNewsletterComponent implements OnInit {

  subscribers: any[] = [];
  search: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  isLoading$: any;
  private searchSubject: Subject<string> = new Subject();

  constructor(public newsletterService: NewsletterService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.isLoading$ = this.newsletterService.isLoading$;
    this.listSubscribers();
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => this.listSubscribers(1));
  }

  listSubscribers(page = 1) {
    this.newsletterService.listSubscribers(page, this.search).subscribe((resp: any) => {
      this.subscribers = resp.subscribers;
      this.totalPages = resp.total;
      this.currentPage = page;
    });
  }

  searchTo() {
    this.searchSubject.next(this.search);
  }

  loadPage(page: any) {
    this.listSubscribers(page);
  }

  eliminar(subscriber: any) {
    this.newsletterService.deleteSubscriber(subscriber.id).subscribe({
      next: () => {
        this.subscribers = this.subscribers.filter(s => s.id !== subscriber.id);
        this.toastr.success('Suscriptor eliminado', 'Éxito');
      },
      error: () => this.toastr.error('No se pudo eliminar', 'Error'),
    });
  }
}
