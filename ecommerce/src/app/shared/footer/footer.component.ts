import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../config/config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  email: string = '';
  mensajeNewsletter: string = '';
  tipoMensaje: string = '';

  constructor(private http: HttpClient) {}

  suscribirse() {
    if (!this.email || !this.email.includes('@')) {
      this.mensajeNewsletter = 'Introduce un email válido';
      this.tipoMensaje = 'error';
      return;
    }

    this.http.post(`${URL_SERVICIOS}/ecommerce/newsletter/subscribe`, { email: this.email }).subscribe({
      next: () => {
        this.mensajeNewsletter = '¡Suscrito correctamente!';
        this.tipoMensaje = 'success';
        this.email = '';
      },
      error: () => {
        this.mensajeNewsletter = 'No se pudo completar la suscripción';
        this.tipoMensaje = 'error';
      }
    });
  }
}
