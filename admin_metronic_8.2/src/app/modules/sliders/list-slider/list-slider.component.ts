import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SlidersService } from '../service/sliders.service';
import { DeleteSliderComponent } from '../delete-slider/delete-slider.component';

@Component({
  selector: 'app-list-slider',
  templateUrl: './list-slider.component.html',
  styleUrls: ['./list-slider.component.scss']
})
export class ListSliderComponent implements OnInit {

  sliders: any[] = [];
  isLoading$: any;

  constructor(
    public slidersService: SlidersService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.slidersService.isLoading$;
    this.listSliders();
  }

  listSliders() {
    this.slidersService.listSliders().subscribe({
      next: (resp: any) => {
        this.sliders = resp.sliders;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('No se pudieron cargar los sliders', 'Error');
      }
    });
  }

  deleteSlider(slider: any) {
    const modalRef = this.modalService.open(DeleteSliderComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.slider = slider;
    modalRef.componentInstance.SliderD.subscribe(() => {
      this.toastr.success('Slider eliminado correctamente');
      this.listSliders();
    });
  }
}
