import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListSaleComponent } from './list-sale/list-sale.component';
import { ShowSaleComponent } from './show-sale/show-sale.component';

const routes: Routes = [
  { path: 'list', component: ListSaleComponent },
  { path: 'show/:id', component: ShowSaleComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesRoutingModule {}
