import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttributesService } from '../service/attributes.service';

@Component({
  selector: 'app-sub-attribute-create',
  templateUrl: './sub-attribute-create.component.html',
  styleUrls: ['./sub-attribute-create.component.scss']
})
export class SubAttributeCreateComponent implements OnInit {

  @Input() attribute: any;

  newProperty: string = '';
  properties: any[] = [];

  constructor(
    public modal: NgbActiveModal,
    public attributesService: AttributesService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.properties = this.attribute.properties ? [...this.attribute.properties] : [];
  }

  addProperty() {
    if (!this.newProperty.trim()) {
      this.toastr.error('Escribe el nombre de la propiedad', 'Validación');
      return;
    }

    const data = { attribute_id: this.attribute.id, name: this.newProperty.trim(), code: '' };

    this.attributesService.createProperty(data).subscribe({
      next: (resp: any) => {
        this.properties.push(resp.propertie);
        this.attribute.properties = this.properties;
        this.newProperty = '';
        this.toastr.success('Propiedad añadida', 'Éxito');
      },
      error: () => {
        this.toastr.error('No se pudo añadir la propiedad', 'Error');
      }
    });
  }

  deleteProperty(propertie: any, index: number) {
    this.attributesService.deleteProperty(propertie.id).subscribe({
      next: () => {
        this.properties.splice(index, 1);
        this.attribute.properties = this.properties;
        this.toastr.success('Propiedad eliminada', 'Éxito');
      },
      error: () => {
        this.toastr.error('No se pudo eliminar la propiedad', 'Error');
      }
    });
  }
}
