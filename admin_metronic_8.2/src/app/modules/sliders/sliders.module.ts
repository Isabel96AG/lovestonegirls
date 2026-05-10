import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { SlidersRoutingModule } from './sliders-routing.module';
import { SlidersComponent } from './sliders.component';
import { ListSliderComponent } from './list-slider/list-slider.component';
import { CreateSliderComponent } from './create-slider/create-slider.component';
import { EditSliderComponent } from './edit-slider/edit-slider.component';
import { DeleteSliderComponent } from './delete-slider/delete-slider.component';

@NgModule({
  declarations: [
    SlidersComponent,
    ListSliderComponent,
    CreateSliderComponent,
    EditSliderComponent,
    DeleteSliderComponent,
  ],
  imports: [
    CommonModule,
    SlidersRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgbModalModule,
  ]
})
export class SlidersModule { }
