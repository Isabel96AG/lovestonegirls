import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SlidersService } from '../service/sliders.service';

@Component({
  selector: 'app-create-slider',
  templateUrl: './create-slider.component.html',
  styleUrls: ['./create-slider.component.scss']
})
export class CreateSliderComponent implements OnInit {

  title: string = '';
  subtitle: string = '';
  label: string = '';
  link: string = '';
  type_slider: number = 1;
  state: number = 1;

  imagen_previsualiza: any = null;
  file_imagen: any = null;
  isLoading$: any;

  constructor(
    public slidersService: SlidersService,
    public toastr: ToastrService,
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.slidersService.isLoading$;
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
    if (!this.title) {
      this.toastr.error('El título es obligatorio', 'Validación');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('subtitle', this.subtitle);
    formData.append('label', this.label);
    formData.append('link', this.link);
    formData.append('type_slider', this.type_slider + '');
    formData.append('state', this.state + '');
    if (this.file_imagen) {
      formData.append('image', this.file_imagen);
    }

    this.slidersService.createSlider(formData).subscribe({
      next: () => {
        this.toastr.success('Slider creado correctamente', 'Éxito');
        this.router.navigate(['/sliders/list']);
      },
      error: () => {
        this.toastr.error('No se pudo crear el slider', 'Error');
      }
    });
  }
}
