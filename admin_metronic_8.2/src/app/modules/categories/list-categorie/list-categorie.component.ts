import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CategoriesService } from '../service/categories.service';
import { DeleteCategorieComponent } from '../delete-categorie/delete-categorie.component';

@Component({
  selector: 'app-list-categorie',
  templateUrl: './list-categorie.component.html',
  styleUrls: ['./list-categorie.component.scss']
})
export class ListCategorieComponent implements OnInit {

  categories: any = [];
  search: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  isLoading$: any;
  private searchSubject: Subject<string> = new Subject();

  constructor(
    public categorieService: CategoriesService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.categorieService.isLoading$;
    this.listCategories();
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.listCategories(1);
    });
  }

  listCategories(page = 1) {
    this.categorieService.listCategories(page, this.search).subscribe({
      next: (resp: any) => {
        this.categories = resp.categories.data;
        this.totalPages = resp.total;
        this.currentPage = page;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando categorías:', err);
      }
    });
  }

  searchTo() {
    this.searchSubject.next(this.search);
  }

  loadPage($event: any) {
    this.listCategories($event);
  }

  deleteCategorie(categorie: any) {
    const modalRef = this.modalService.open(DeleteCategorieComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.categorie = categorie;
    modalRef.componentInstance.CategorieD.subscribe(() => {
      this.toastr.success('Categoría eliminada correctamente');
      this.listCategories(this.currentPage);
    });
  }

  getDomParser(categorie: any) {
    var miDiv: any = document.getElementById('svg-categorie-' + categorie.id);
    if (miDiv) miDiv.innerHTML = categorie.icon;
    return '';
  }
}
