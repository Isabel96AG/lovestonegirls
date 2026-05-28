import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminsService } from '../service/admins.service';

@Component({
  selector: 'app-list-admin',
  templateUrl: './list-admin.component.html',
})
export class ListAdminComponent implements OnInit {

  admins: any[] = [];
  form: FormGroup;
  guardando = false;
  mostrarFormulario = false;

  constructor(
    private adminsService: AdminsService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      surname:  ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      phone:    ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.adminsService.listAdmins().subscribe({
      next: (resp: any) => {
        this.admins = resp.admins;
        this.cdr.detectChanges();
      },
    });
  }

  guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    this.adminsService.createAdmin(this.form.value).subscribe({
      next: (resp: any) => {
        this.admins.unshift(resp.admin);
        this.form.reset();
        this.mostrarFormulario = false;
        this.guardando = false;
        this.toastr.success('Administrador creado correctamente', 'Éxito');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.guardando = false;
        const msg = err?.error?.errors
          ? ([] as string[]).concat(...Object.values(err.error.errors) as string[][]).join(' ')
          : 'Error al crear el administrador';
        this.toastr.error(msg as string, 'Error');
      },
    });
  }

  eliminar(admin: any) {
    if (!confirm(`¿Eliminar a ${admin.name} como administrador?`)) return;
    this.adminsService.deleteAdmin(admin.id).subscribe({
      next: () => {
        this.admins = this.admins.filter(a => a.id !== admin.id);
        this.toastr.success('Administrador eliminado', 'Éxito');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.error || 'No se pudo eliminar', 'Error');
      },
    });
  }
}
