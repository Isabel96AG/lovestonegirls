import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListNewsletterComponent } from './list-newsletter/list-newsletter.component';

const routes: Routes = [
  { path: 'list', component: ListNewsletterComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewsletterRoutingModule {}
