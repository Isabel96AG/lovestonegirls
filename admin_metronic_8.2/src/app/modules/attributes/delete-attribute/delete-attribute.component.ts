import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttributesService } from '../service/attributes.service';

@Component({
  selector: 'app-delete-attribute',
  templateUrl: './delete-attribute.component.html',
  styleUrls: ['./delete-attribute.component.scss']
})
export class DeleteAttributeComponent implements OnInit {

  @Input() attribute: any;
  @Output() AttributeD: EventEmitter<any> = new EventEmitter();
  isLoading$: any;

  constructor(
    public modal: NgbActiveModal,
    public attributesService: AttributesService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.attributesService.isLoading$;
  }

  delete() {
    this.attributesService.deleteAttribute(this.attribute.id).subscribe({
      next: () => {
        this.AttributeD.emit(this.attribute);
        this.modal.close();
      },
      error: () => {
        this.toastr.error('No se pudo eliminar el atributo', 'Error');
      }
    });
  }
}
