import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SalesService } from '../service/sales.service';

@Component({
  selector: 'app-show-sale',
  templateUrl: './show-sale.component.html',
  styleUrls: ['./show-sale.component.scss']
})
export class ShowSaleComponent implements OnInit {

  sale: any = null;
  error: string = '';
  saleId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public salesService: SalesService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.saleId = Number(params['id']);
      this.sale = null;
      this.error = '';
      this.cdr.detectChanges();
      this.cargarPedido(this.saleId);
    });
  }

  cargarPedido(id: number) {
    if (!id || isNaN(id)) {
      this.error = 'ID de pedido no válido';
      this.cdr.detectChanges();
      return;
    }
    this.salesService.showSale(id).subscribe({
      next: (resp: any) => {
        this.sale = resp.sale ?? null;
        if (!this.sale) {
          this.error = 'El pedido no devolvió datos';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Error ' + (err?.status || '') + ': ' + (err?.error?.message || 'No se pudo cargar el pedido');
        this.cdr.detectChanges();
        this.toastr.error(this.error, 'Error');
      },
    });
  }

  marcarEnviado() {
    this.salesService.updateState(this.sale.id, 'enviado').subscribe({
      next: (resp: any) => {
        this.sale = resp.sale;
        this.cdr.detectChanges();
        this.toastr.success('Pedido marcado como enviado', 'Éxito');
      },
      error: () => this.toastr.error('No se pudo actualizar el estado', 'Error'),
    });
  }

  marcarPendiente() {
    this.salesService.updateState(this.sale.id, 'pendiente').subscribe({
      next: (resp: any) => {
        this.sale = resp.sale;
        this.cdr.detectChanges();
        this.toastr.success('Pedido marcado como pendiente', 'Éxito');
      },
      error: () => this.toastr.error('No se pudo actualizar el estado', 'Error'),
    });
  }

  imprimir() {
    window.print();
  }

  volver() {
    this.router.navigate(['/sales/list']);
  }
}
