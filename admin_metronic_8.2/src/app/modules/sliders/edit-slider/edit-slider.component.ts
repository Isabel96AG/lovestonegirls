import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SlidersService } from '../service/sliders.service';

@Component({
  selector: 'app-edit-slider',
  templateUrl: './edit-slider.component.html',
  styleUrls: ['./edit-slider.component.scss']
})
export class EditSliderComponent implements OnInit {

  slider_id: any;
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
    public activedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.slidersService.isLoading$;
    this.activedRoute.params.subscribe((params: any) => {
      this.slider_id = params.id;
      this.slidersService.showSlider(params.id).subscribe({
        next: (resp: any) => {
          const s = resp.slider;
          this.title = s.title;
          this.subtitle = s.subtitle ?? '';
          this.label = s.label ?? '';
          this.link = s.link ?? '';
          this.type_slider = s.type_slider;
          this.state = s.state;
          this.imagen_previsualiza = s.image ?? null;
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastr.error('No se pudo cargar el slider', 'Error');
        }
      });
    });
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
    formData.append('_method', 'PUT');
    formData.append('title', this.title);
    formData.append('subtitle', this.subtitle);
    formData.append('label', this.label);
    formData.append('link', this.link);
    formData.append('type_slider', this.type_slider + '');
    formData.append('state', this.state + '');
    if (this.file_imagen) {
      formData.append('image', this.file_imagen);
    }

    this.slidersService.updateSlider(this.slider_id, formData).subscribe({
      next: () => {
        this.toastr.success('Slider actualizado correctamente', 'Éxito');
        this.router.navigate(['/sliders/list']);
      },
      error: () => {
        this.toastr.error('No se pudo actualizar el slider', 'Error');
      }
    });
  }
}
