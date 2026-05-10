import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ProductsService } from '../service/products.service';

@Component({
  selector: 'app-delete-product',
  templateUrl: './delete-product.component.html',
  styleUrls: ['./delete-product.component.scss']
})
export class DeleteProductComponent implements OnInit {

  @Input() product: any;
  @Output() ProductD: EventEmitter<any> = new EventEmitter();
  isLoading$: any;

  constructor(
    public modal: NgbActiveModal,
    public productsService: ProductsService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.productsService.isLoading$;
  }

  delete() {
    this.productsService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this.ProductD.emit({ message: 200 });
        this.modal.close();
      },
      error: () => {
        this.toastr.error('No se pudo eliminar el producto', 'Error');
      }
    });
  }
}
