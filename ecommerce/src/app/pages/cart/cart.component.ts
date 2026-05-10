import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {

  items: any[] = [];
  cargando: boolean = true;

  constructor(
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.cartService.getCarts().subscribe({
      next: (resp: any) => {
        this.items = resp.carts;
        this.cartService.setTotalItems(this.items.length);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cambiarCantidad(item: any, cantidad: number) {
    if (cantidad < 1) return;
    this.cartService.updateCart(item.id, cantidad).subscribe({
      next: () => {
        item.quantity = cantidad;
        item.total = item.price_unit * cantidad;
      }
    });
  }

  eliminar(item: any) {
    this.cartService.removeCart(item.id).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== item.id);
        this.cartService.setTotalItems(this.items.length);
        this.toastr.success('Producto eliminado del carrito');
      }
    });
  }

  get total(): number {
    return this.items.reduce((acc, i) => acc + parseFloat(i.total), 0);
  }
}
