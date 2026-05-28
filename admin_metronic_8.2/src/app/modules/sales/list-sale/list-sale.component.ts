import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { SalesService } from '../service/sales.service';

@Component({
  selector: 'app-list-sale',
  templateUrl: './list-sale.component.html',
  styleUrls: ['./list-sale.component.scss']
})
export class ListSaleComponent implements OnInit {

  sales: any[] = [];
  search: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  isLoading$: any;
  private searchSubject: Subject<string> = new Subject();

  constructor(public salesService: SalesService, private router: Router) {}

  ngOnInit(): void {
    this.isLoading$ = this.salesService.isLoading$;
    this.listSales();
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => this.listSales(1));
  }

  listSales(page = 1) {
    this.salesService.listSales(page, this.search).subscribe((resp: any) => {
      this.sales = resp.sales;
      this.totalPages = resp.total;
      this.currentPage = page;
    });
  }

  searchTo() {
    this.searchSubject.next(this.search);
  }

  loadPage(page: any) {
    this.listSales(page);
  }

  verDetalle(id: number) {
    this.router.navigate(['/sales/show', id]);
  }

  badgeClass(state: string): string {
    switch (state) {
      case 'pendiente':  return 'badge-light-warning';
      case 'enviado':    return 'badge-light-success';
      case 'cancelado':  return 'badge-light-danger';
      default:           return 'badge-light-info';
    }
  }
}
