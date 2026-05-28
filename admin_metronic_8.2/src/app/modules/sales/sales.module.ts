import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SalesRoutingModule } from './sales-routing.module';
import { ListSaleComponent } from './list-sale/list-sale.component';
import { ShowSaleComponent } from './show-sale/show-sale.component';

@NgModule({
  declarations: [ListSaleComponent, ShowSaleComponent],
  imports: [CommonModule, SalesRoutingModule, FormsModule, NgbModule],
})
export class SalesModule {}
