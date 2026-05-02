import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  name:string = '';
  surname: string = '';
  email: string = '';
  password: string = '';
  phone:string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {

  }

  register(){
    // 1. Comprobar que no haya campos vacíos
    if(!this.name || !this.surname || !this.email || !this.password || !this.phone){
      this.toastr.error("Validacion","Necesitas ingresar todos los campos");
      return;
    }

    // 2. Nombre y apellido — mínimo 2 caracteres
    if(this.name.trim().length < 2){
      this.toastr.error("Validacion","El nombre debe tener al menos 2 caracteres");
      return;
    }
    if(this.surname.trim().length < 2){
      this.toastr.error("Validacion","El apellido debe tener al menos 2 caracteres");
      return;
    }

    // 3. Email — formato válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(this.email)){
      this.toastr.error("Validacion","El email no tiene un formato válido");
      return;
    }

    // 4. Teléfono — exactamente 9 dígitos numéricos
    const phoneRegex = /^\d{9}$/;
    if(!phoneRegex.test(this.phone)){
      this.toastr.error("Validacion","El teléfono debe tener exactamente 9 dígitos");
      return;
    }

    // 5. Contraseña — mínimo 8 caracteres
    if(this.password.length < 8){
      this.toastr.error("Validacion","La contraseña debe tener al menos 8 caracteres");
      return;
    }

    let data = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password,
      phone: this.phone,
    }
    this.authService.register(data).subscribe({
      next: (resp:any) => {
        console.log(resp);
        this.toastr.success("Exito","Ingresa a tu correo para poder completar tu registro");
        setTimeout(() => {
          this.router.navigateByUrl("/login");
        }, 500);
      },
      error: (err:any) => {
        console.log(err);
        this.toastr.error("Error","No se pudo registrar (revisa los datos)");
      }
    });
  }
}
