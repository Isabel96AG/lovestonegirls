import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NewsletterRoutingModule } from './newsletter-routing.module';
import { ListNewsletterComponent } from './list-newsletter/list-newsletter.component';

@NgModule({
  declarations: [ListNewsletterComponent],
  imports: [CommonModule, NewsletterRoutingModule, HttpClientModule, FormsModule, NgbModule],
})
export class NewsletterModule {}
