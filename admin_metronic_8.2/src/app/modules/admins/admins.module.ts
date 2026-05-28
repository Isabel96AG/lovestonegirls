import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminsRoutingModule } from './admins-routing.module';
import { ListAdminComponent } from './list-admin/list-admin.component';

@NgModule({
  declarations: [ListAdminComponent],
  imports: [CommonModule, AdminsRoutingModule, ReactiveFormsModule],
})
export class AdminsModule {}
