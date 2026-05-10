import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ProductsService } from '../service/products.service';
import { DeleteProductComponent } from '../delete-product/delete-product.component';

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss']
})
export class ListProductComponent implements OnInit {

  products: any[] = [];
  search: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  isLoading$: any;
  private searchSubject: Subject<string> = new Subject();

  constructor(
    public productsService: ProductsService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.productsService.isLoading$;
    this.listProducts();
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.listProducts(1);
    });
  }

  listProducts(page: number = 1) {
    this.productsService.listProducts(page, this.search).subscribe({
      next: (resp: any) => {
        this.products = resp.products;
        this.totalPages = resp.total;
        this.currentPage = page;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('No se pudieron cargar los productos', 'Error');
      }
    });
  }

  searchTo() {
    this.searchSubject.next(this.search);
  }

  loadPage($event: any) {
    this.listProducts($event);
  }

  deleteProduct(product: any) {
    const modalRef = this.modalService.open(DeleteProductComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.product = product;
    modalRef.componentInstance.ProductD.subscribe(() => {
      this.toastr.success('Producto eliminado correctamente');
      this.listProducts(this.currentPage);
    });
  }
}
