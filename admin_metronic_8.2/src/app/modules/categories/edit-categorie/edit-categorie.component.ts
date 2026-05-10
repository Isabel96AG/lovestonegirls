import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CategoriesService } from '../service/categories.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-categorie',
  templateUrl: './edit-categorie.component.html',
  styleUrls: ['./edit-categorie.component.scss']
})
export class EditCategorieComponent implements OnInit {

  categorie_id: string = '';
  type_categorie: number = 1;
  name: string = '';
  icon: any = null;
  position: number = 1;
  categorie_second_id: string = '';
  categorie_third_id: string = '';

  imagen_previsualiza: string | null = null;
  file_imagen: any = null;
  default_icon: string = "/assets/media/svg/files/blank-image.svg";

  categories_first: any[] = [];
  categories_seconds: any[] = [];
  categories_seconds_filtered: any[] = [];

  isLoading$: any;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    public categorieService: CategoriesService,
    private toastr: ToastrService,
    public activedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.categorieService.isLoading$;

    this.activedRoute.params.subscribe((params: any) => {
      this.categorie_id = params.id;

      forkJoin({
        config: this.categorieService.configCategories(),
        categorie: this.categorieService.showCategorie(params.id)
      }).subscribe({
        next: (resp: any) => {
          this.categories_first = resp.config.categories_first;
          this.categories_seconds = resp.config.categories_seconds;

          const cat = resp.categorie.categorie;
          this.type_categorie = cat.type_categorie;
          this.name = cat.name;
          this.icon = cat.icon;
          this.position = cat.position;
          this.imagen_previsualiza = cat.image ?? null;

          if (cat.type_categorie === 2) {
            this.categorie_second_id = cat.categorie_second_id + '';
          }
          if (cat.type_categorie === 3) {
            this.categorie_third_id = cat.categorie_third_id + '';
            this.categorie_second_id = cat.categorie_second_id + '';
            this.categories_seconds_filtered = this.categories_seconds.filter(
              (c: any) => c.categorie_second_id == cat.categorie_third_id
            );
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastr.error('Error', 'No se pudo cargar la categoría');
        }
      });
    });
  }

  changeTypeCategorie(val: number) {
    this.type_categorie = val;
    this.categorie_second_id = '';
    this.categorie_third_id = '';
    this.categories_seconds_filtered = [];
  }

  changeDepartament() {
    this.categorie_second_id = '';
    this.categories_seconds_filtered = this.categories_seconds.filter(
      (cat: any) => cat.categorie_second_id == this.categorie_third_id
    );
  }

  processFile($event: any) {
    if ($event.target.files[0].type.indexOf("image") < 0) {
      this.toastr.error("Validación", "El archivo no es una imagen");
      return;
    }
    this.file_imagen = $event.target.files[0];
    let reader = new FileReader();
    reader.onloadend = () => this.imagen_previsualiza = reader.result as string;
    reader.readAsDataURL(this.file_imagen);
  }

  save() {
    if (!this.name || !this.position) {
      this.toastr.error("Validacion", "Los campos Nombre y Posición son obligatorios");
      return;
    }
    if (this.type_categorie === 2 && !this.categorie_second_id) {
      this.toastr.error("Validacion", "El departamento es obligatorio");
      return;
    }
    if (this.type_categorie === 3 && (!this.categorie_third_id || !this.categorie_second_id)) {
      this.toastr.error("Validacion", "El departamento y la categoría son obligatorios");
      return;
    }

    let formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", this.name);
    formData.append("icon", this.icon ?? '');
    formData.append("position", this.position + "");
    formData.append("type_categorie", this.type_categorie + "");
    if (this.file_imagen) {
      formData.append("image", this.file_imagen);
    }
    if (this.categorie_second_id) {
      formData.append("categorie_second_id", this.categorie_second_id);
    }
    if (this.categorie_third_id) {
      formData.append("categorie_third_id", this.categorie_third_id);
    }

    this.categorieService.updateCategories(this.categorie_id, formData).subscribe({
      next: (resp: any) => {
        if (resp.message == 403) {
          this.toastr.error("Error", "Ya existe una categoría con ese nombre");
          return;
        }
        this.toastr.success("Éxito", "Categoría actualizada correctamente");
        this.router.navigate(['/categories/list']);
      },
      error: () => {
        this.toastr.error("Error", "No se pudo actualizar la categoría");
      }
    });
  }
}
