import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EcommerceService } from '../../services/ecommerce.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {

  productos: any[] = [];
  categorias: any[] = [];
  total: number = 0;
  paginaActual: number = 1;
  busqueda: string = '';
  categoriaSeleccionada: any = '';

  // criterio de ordenación seleccionado por el usuario
  ordenar: string = '';

  constructor(
    private ecommerceService: EcommerceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // cargo las categorías para los botones de filtro
    this.ecommerceService.getHome().subscribe((resp: any) => {
      this.categorias = resp.categories;
    });

    // leo los queryParams directamente (ahora siempre vienen con categorie_id)
    this.route.queryParams.subscribe(params => {
      this.categoriaSeleccionada = params['categorie_id'] || '';
      this.busqueda = params['search'] || '';
      this.cargarProductos();
    });
  }

  cargarProductos() {
    this.ecommerceService.getProducts(this.paginaActual, this.busqueda, this.categoriaSeleccionada).subscribe((resp: any) => {
      this.productos = resp.products;
      this.total = resp.total;
      // aplicamos el orden actual después de cargar los productos
      this.aplicarOrden();
    });
  }

  // ordena el array de productos según la opción elegida en el select
  aplicarOrden() {
    if (this.ordenar === 'precio-asc') {
      // de menor a mayor precio — creamos un array nuevo para que Angular detecte el cambio
      this.productos = [...this.productos].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (this.ordenar === 'precio-desc') {
      // de mayor a menor precio
      this.productos = [...this.productos].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
  }

  filtrarPorCategoria(id: any) {
    this.categoriaSeleccionada = id;
    this.paginaActual = 1;
    this.cargarProductos();
  }

  buscar() {
    this.paginaActual = 1;
    this.cargarProductos();
  }

  get totalPaginas(): number {
    return Math.ceil(this.total / 12);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarProductos();
    window.scrollTo(0, 0);
  }
}
