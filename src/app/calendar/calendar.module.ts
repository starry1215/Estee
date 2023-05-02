import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CustomPipeModule } from '../pipe/custom-pipe.module';
import { TranslateModule } from '@ngx-translate/core';
import { SlideFuncService } from './slide/slide-func.service';
import { AlertSlideComponent } from './slide/alert-slide.component';
import { SlideFuncDirective } from './slide/slide-func.directive';
import { LocalConfigSlideComponent } from './slide/local-config-slide.component';
import { EsteeEntryComponent } from './estee.component';

@NgModule({
  declarations: [
    AlertSlideComponent,
    LocalConfigSlideComponent,
    EsteeEntryComponent,

    SlideFuncDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CustomPipeModule,
    FontAwesomeModule,
    TranslateModule.forChild({
      extend: true
    })
  ],
  providers: [
    DatePipe,
    SlideFuncService
  ],
  exports: [
    EsteeEntryComponent
  ]
})
export class CalendarModule { }
