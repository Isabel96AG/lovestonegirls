import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SlidersService } from '../service/sliders.service';

@Component({
  selector: 'app-delete-slider',
  templateUrl: './delete-slider.component.html',
  styleUrls: ['./delete-slider.component.scss']
})
export class DeleteSliderComponent implements OnInit {

  @Input() slider: any;
  @Output() SliderD: EventEmitter<any> = new EventEmitter();
  isLoading$: any;

  constructor(
    public modal: NgbActiveModal,
    public slidersService: SlidersService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.slidersService.isLoading$;
  }

  delete() {
    this.slidersService.deleteSlider(this.slider.id).subscribe({
      next: () => {
        this.SliderD.emit({ message: 200 });
        this.modal.close();
      },
      error: () => {
        this.toastr.error('No se pudo eliminar el slider', 'Error');
      }
    });
  }
}
