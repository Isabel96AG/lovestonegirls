import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ProductsService } from '../service/products.service';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {

  product_id: any;
  title: string = '';
  price: number = 0;
  description: string = '';
  state: number = 1;
  categorie_first_id: string = '';
  categorie_second_id: string = '';
  categorie_third_id: string = '';

  categories_first: any[] = [];
  categories_seconds: any[] = [];
  categories_thirds: any[] = [];
  categories_seconds_filtered: any[] = [];
  categories_thirds_filtered: any[] = [];

  attributes: any[] = [];
  selectedVariations: any = {};

  imagen_previsualiza: any = null;
  file_imagen: any = null;
  isLoading$: any;

  constructor(
    public productsService: ProductsService,
    public toastr: ToastrService,
    public router: Router,
    public activedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.productsService.isLoading$;
    this.activedRoute.params.subscribe((params: any) => {
      this.product_id = params.id;
      forkJoin({
        config: this.productsService.configProducts(),
        product: this.productsService.showProduct(params.id),
      }).subscribe({
        next: (resp: any) => {
          this.categories_first = resp.config.categories_first;
          this.categories_seconds = resp.config.categories_seconds;
          this.categories_thirds = resp.config.categories_thirds;
          this.attributes = resp.config.attributes;

          const p = resp.product.product;
          this.title = p.title;
          this.price = p.price;
          this.description = p.description ?? '';
          this.state = p.state;
          this.imagen_previsualiza = p.image ?? null;
          this.categorie_first_id = p.categorie_first_id + '';
          this.categorie_second_id = p.categorie_second_id + '';
          this.categorie_third_id = p.categorie_third_id + '';

          this.categories_seconds_filtered = this.categories_seconds.filter(
            (c: any) => c.categorie_second_id == this.categorie_first_id
          );
          this.categories_thirds_filtered = this.categories_thirds.filter(
            (c: any) => c.categorie_second_id == this.categorie_second_id
          );

          // precargar variaciones seleccionadas
          if (p.variations) {
            p.variations.forEach((v: any) => {
              this.selectedVariations[v.attribute_id] = v.propertie_id + '';
            });
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.toastr.error('No se pudo cargar el producto', 'Error');
        }
      });
    });
  }

  onChangeFirst() {
    this.categorie_second_id = '';
    this.categorie_third_id = '';
    this.categories_seconds_filtered = this.categories_seconds.filter(
      (c: any) => c.categorie_second_id == this.categorie_first_id
    );
    this.categories_thirds_filtered = [];
  }

  onChangeSecond() {
    this.categorie_third_id = '';
    this.categories_thirds_filtered = this.categories_thirds.filter(
      (c: any) => c.categorie_second_id == this.categorie_second_id
    );
  }

  procesarImagen(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.file_imagen = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagen_previsualiza = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  save() {
    if (!this.title || !this.price) {
      this.toastr.error('El título y el precio son obligatorios', 'Validación');
      return;
    }

    const variations = this.attributes.map((attr: any) => ({
      attribute_id: attr.id,
      propertie_id: this.selectedVariations[attr.id] || null,
    }));

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('title', this.title);
    formData.append('price', this.price + '');
    formData.append('description', this.description);
    formData.append('state', this.state + '');
    formData.append('categorie_first_id', this.categorie_first_id);
    formData.append('categorie_second_id', this.categorie_second_id);
    formData.append('categorie_third_id', this.categorie_third_id);
    formData.append('variations', JSON.stringify(variations));
    if (this.file_imagen) {
      formData.append('image', this.file_imagen);
    }

    this.productsService.updateProduct(this.product_id, formData).subscribe({
      next: () => {
        this.toastr.success('Producto actualizado correctamente', 'Éxito');
        this.router.navigate(['/products/list']);
      },
      error: () => {
        this.toastr.error('No se pudo actualizar el producto', 'Error');
      }
    });
  }
}
