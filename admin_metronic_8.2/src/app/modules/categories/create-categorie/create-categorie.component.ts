import { Component } from '@angular/core';

@Component({
  selector: 'app-create-categorie',
  templateUrl: './create-categorie.component.html',
  styleUrls: ['./create-categorie.component.scss']
})
export class CreateCategorieComponent {

  imagen_previsualiza: string | ArrayBuffer | null = null;
  file_imagen: File | null = null;

  processFile($event: any) {
    const file: File = $event.target.files[0];
    if (!file) return;

    this.file_imagen = file;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.imagen_previsualiza = reader.result;
    };
  }

}
