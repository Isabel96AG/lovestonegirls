import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CategoriesService } from '../service/categories.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-categorie',
  templateUrl: './create-categorie.component.html',
  styleUrls: ['./create-categorie.component.scss']
})
export class CreateCategorieComponent implements OnInit {
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

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    public categorieService: CategoriesService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.categorieService.configCategories().subscribe({
      next: (resp: any) => {
        this.categories_first = resp.categories_first;
        this.categories_seconds = resp.categories_seconds;
      },
      error: (err: any) => {
        console.error('Error cargando config categorías:', err);
        this.toastr.error('Error', 'No se pudieron cargar las categorías');
      }
    });
  }

  changeTypeCategorie(val: number) {
    this.type_categorie = val;
    this.categorie_second_id = '';
    this.categorie_third_id = '';
    this.categories_seconds_filtered = [];
  }

  // Al cambiar el departamento en nivel 3, filtra las categorías de segundo nivel
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
    if (this.type_categorie === 1 && !this.file_imagen) {
      this.toastr.error("Validacion", "La imagen es obligatoria para un Departamento");
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

    this.categorieService.createCategories(formData).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.toastr.error("Error", "Ya existe una categoría con ese nombre");
        return;
      }
      this.toastr.success("Éxito", "Categoría creada correctamente");
      this.resetForm();
    });
  }

  resetForm() {
    this.type_categorie = 1;
    this.name = '';
    this.icon = null;
    this.position = 1;
    this.categorie_second_id = '';
    this.categorie_third_id = '';
    this.file_imagen = null;
    this.imagen_previsualiza = null;
    this.categories_seconds_filtered = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.categorieService.configCategories().subscribe({
      next: (resp: any) => {
        this.categories_first = resp.categories_first;
        this.categories_seconds = resp.categories_seconds;
      }
    });
  }
}
