import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EcommerceService } from '../../services/ecommerce.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  productos: any[] = [];
  categorias: any[] = [];
  sliders: any[] = [];

  constructor(private ecommerceService: EcommerceService) {}

  ngOnInit() {
    this.ecommerceService.getHome().subscribe((resp: any) => {
      this.productos = resp.products;
      this.categorias = resp.categories;
      this.sliders = resp.sliders;
    });
  }
}
