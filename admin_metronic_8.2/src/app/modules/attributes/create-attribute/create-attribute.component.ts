import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttributesService } from '../service/attributes.service';

@Component({
  selector: 'app-create-attribute',
  templateUrl: './create-attribute.component.html',
  styleUrls: ['./create-attribute.component.scss']
})
export class CreateAttributeComponent implements OnInit {

  @Output() AttributeC: EventEmitter<any> = new EventEmitter();

  name: string = '';
  type_attribute: number = 3;
  isLoading$: any;

  constructor(
    public attributesService: AttributesService,
    public modal: NgbActiveModal,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.attributesService.isLoading$;
  }

  store() {
    if (!this.name || !this.type_attribute) {
      this.toastr.error('Todos los campos son necesarios', 'Validación');
      return;
    }

    const data = {
      name: this.name,
      type_attribute: this.type_attribute,
      state: 1,
    };

    this.attributesService.createAttribute(data).subscribe({
      next: (resp: any) => {
        if (resp.message == 403) {
          this.toastr.error('Este atributo ya existe', 'Error');
          return;
        }
        this.toastr.success('Atributo creado correctamente', 'Éxito');
        this.AttributeC.emit(resp.attribute);
        this.modal.close(true);
      },
      error: () => {
        this.toastr.error('No se pudo crear el atributo', 'Error');
      }
    });
  }
}
