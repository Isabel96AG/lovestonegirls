import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SaleService } from '../../services/sale.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss'
})
export class OrderConfirmationComponent implements OnInit {

  pedido: any = null;
  cargando: boolean = true;

  constructor(
    private saleService: SaleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // recogemos el id del pedido de la URL
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.saleService.getSale(id).subscribe({
      next: (resp: any) => {
        this.pedido = resp.sale;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
}
