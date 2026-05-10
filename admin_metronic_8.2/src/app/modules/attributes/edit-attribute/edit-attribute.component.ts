import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttributesService } from '../service/attributes.service';

@Component({
  selector: 'app-edit-attribute',
  templateUrl: './edit-attribute.component.html',
  styleUrls: ['./edit-attribute.component.scss']
})
export class EditAttributeComponent implements OnInit {

  @Input() attribute: any;
  @Output() AttributeE: EventEmitter<any> = new EventEmitter();

  name: string = '';
  type_attribute: number = 1;
  isLoading$: any;

  constructor(
    public modal: NgbActiveModal,
    public attributesService: AttributesService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.attributesService.isLoading$;
    this.name = this.attribute.name;
    this.type_attribute = this.attribute.type_attribute;
  }

  save() {
    if (!this.name) {
      this.toastr.error('El nombre es obligatorio', 'Validación');
      return;
    }

    const data = { name: this.name, type_attribute: this.type_attribute };

    this.attributesService.updateAttribute(this.attribute.id, data).subscribe({
      next: (resp: any) => {
        if (resp.message == 403) {
          this.toastr.error('Ya existe un atributo con ese nombre', 'Error');
          return;
        }
        this.toastr.success('Atributo actualizado correctamente', 'Éxito');
        this.AttributeE.emit({ ...this.attribute, ...data });
        this.modal.close();
      },
      error: () => {
        this.toastr.error('No se pudo actualizar el atributo', 'Error');
      }
    });
  }
}
