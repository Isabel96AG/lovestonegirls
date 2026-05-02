import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email:string = '';
  password:string = '';
  code_user:string = '';
  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    public router: Router,
    public activedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.showSuccess();
    if(this.authService.token && this.authService.user){
      this.router.navigateByUrl("/");
      return;
    }
    this.activedRoute.queryParams.subscribe((resp:any) => {
      this.code_user = resp.code;
    })
    if(this.code_user){
      let data = {
        code_user: this.code_user,
      }
      this.authService.verifiedAuth(data).subscribe((resp:any) =>{
        console.log(resp);
        if(resp.message == 403){
           this.toastr.error("Validacion", "El código no pertenece a ningun usuario");
           }
        if(resp.message == 200){
           this.toastr.success("Exito", "El correo ha sido verificado, ingresar a la tienda");
           setTimeout(() => {
            this.router.navigateByUrl("/login");
           },500);
           }
      })
    }
  }

  login(){
    // 1. Campos vacíos
    if(!this.email || !this.password){
      this.toastr.error("Validacion","Necesitas ingresar todos los campos");
      return;
    }

    // 2. Email con formato válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(this.email)){
      this.toastr.error("Validacion","El email no tiene un formato válido");
      return;
    }

    this.authService.login(this.email,this.password).subscribe((resp:any) => {
      console.log(resp);
      if(resp === true){
        this.toastr.success("Bienvenido", "Login exitoso");
        this.router.navigateByUrl("/");
      } else {
        this.toastr.error("Credenciales incorrectas", "Error de login");
      }
    })
  }

  showSuccess() {
    this.toastr.success('Hello world!', 'Toastr fun!');
  }
}
