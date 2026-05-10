import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { EcommerceService } from '../../services/ecommerce.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../pages/auth/service/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  categorias: any[] = [];
  categorias_second: any[] = [];
  categorias_third: any[] = [];
  expandido: { [id: number]: boolean } = {};
  totalCarrito: number = 0;

  constructor(
    private ecommerceService: EcommerceService,
    private cartService: CartService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.ecommerceService.getHome().subscribe((resp: any) => {
      this.categorias = resp.categories;
      this.categorias_second = resp.categories_second || [];
      this.categorias_third = resp.categories_third || [];
    });

    this.cartService.totalItems$.subscribe(n => {
      this.totalCarrito = n;
    });

    if (localStorage.getItem('token')) {
      this.cartService.getCarts().subscribe((resp: any) => {
        this.cartService.setTotalItems(resp.carts.length);
      });
    }
  }

  toggle(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.expandido[id] = !this.expandido[id];
  }

  getHijos(parentId: number): any[] {
    return this.categorias_second.filter(
      (c: any) => c.categorie_second_id == parentId
    );
  }

  getNietos(parentId: number): any[] {
    return this.categorias_third.filter(
      (c: any) => c.categorie_second_id == parentId
    );
  }

  irALogin(event: Event) {
    this.router.navigate(['/login']);
  }

  logout() {
    this.cartService.setTotalItems(0);
    this.authService.logout();
  }

  get usuarioNombre(): string {
    return this.authService.user?.full_name || this.authService.user?.name || '';
  }

  get estaLogueado(): boolean {
    return !!this.authService.token;
  }
}
