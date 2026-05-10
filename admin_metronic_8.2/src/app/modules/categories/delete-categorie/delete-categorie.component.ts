import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CategoriesService } from '../service/categories.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delete-categorie',
  templateUrl: './delete-categorie.component.html',
  styleUrls: ['./delete-categorie.component.scss']
})
export class DeleteCategorieComponent implements OnInit {

  @Input() categorie: any;
  @Output() CategorieD: EventEmitter<any> = new EventEmitter();

  isLoading: any;

  constructor(
    public categorieService: CategoriesService,
    private toastr: ToastrService,
    public modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.isLoading = this.categorieService.isLoading$;
  }

  delete() {
    this.categorieService.deleteCategorie(this.categorie.id).subscribe((resp: any) => {
      this.CategorieD.emit({ message: 200 });
      this.modal.close();
    });
  }
}
