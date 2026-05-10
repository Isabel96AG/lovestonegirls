import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SlidersComponent } from './sliders.component';
import { ListSliderComponent } from './list-slider/list-slider.component';
import { CreateSliderComponent } from './create-slider/create-slider.component';
import { EditSliderComponent } from './edit-slider/edit-slider.component';

const routes: Routes = [
  {
    path: '',
    component: SlidersComponent,
    children: [
      { path: 'list', component: ListSliderComponent },
      { path: 'create', component: CreateSliderComponent },
      { path: 'list/edit/:id', component: EditSliderComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SlidersRoutingModule { }
