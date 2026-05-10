import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EcommerceService } from '../../services/ecommerce.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {

  producto: any = null;
  imagenPrincipal: string = '';
  cargando: boolean = true;
  agregando: boolean = false;

  constructor(
    private ecommerceService: EcommerceService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.ecommerceService.getProduct(slug).subscribe({
      next: (resp: any) => {
        this.producto = resp.product;
        this.imagenPrincipal = this.producto.image || 'assets/img/product/placeholder.jpg';
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cambiarImagen(url: string) {
    this.imagenPrincipal = url;
  }

  addToCart() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.agregando = true;
    const data = {
      product_id: this.producto.id,
      quantity: 1,
      price_unit: this.producto.price,
    };

    this.cartService.addCart(data).subscribe({
      next: (resp: any) => {
        this.toastr.success('Producto añadido al carrito', '¡Listo!');
        // actualizar el contador del header
        this.cartService.getCarts().subscribe((r: any) => {
          this.cartService.setTotalItems(r.carts.length);
        });
        this.agregando = false;
      },
      error: () => {
        this.toastr.error('Inicia sesión para añadir al carrito', 'Error');
        this.agregando = false;
      }
    });
  }

  get variacionesAgrupadas(): { atributo: string, opciones: string[] }[] {
    if (!this.producto?.variations) return [];
    const grupos: { [key: string]: string[] } = {};
    for (const v of this.producto.variations) {
      if (!grupos[v.attribute]) grupos[v.attribute] = [];
      if (v.propertie && !grupos[v.attribute].includes(v.propertie)) {
        grupos[v.attribute].push(v.propertie);
      }
    }
    return Object.entries(grupos).map(([atributo, opciones]) => ({ atributo, opciones }));
  }
}
