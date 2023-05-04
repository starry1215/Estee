import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CustomPipeModule } from '../pipe/custom-pipe.module';
import { TranslateModule } from '@ngx-translate/core';
import { EsteeEntryComponent } from './estee.component';

@NgModule({
  declarations: [
    EsteeEntryComponent
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
    DatePipe
  ],
  exports: [
    EsteeEntryComponent
  ]
})
export class CalendarModule { }
