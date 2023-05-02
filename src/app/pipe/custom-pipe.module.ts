import { NgModule } from '@angular/core';
import { CustomDatePipe } from './cs-date.pipe';
import { CustomTimePipe } from './cs-time.pipe';
import { TextOverflowPipe } from './text-overflow.pipe';

@NgModule({
    declarations: [
        TextOverflowPipe,
        CustomTimePipe,
        CustomDatePipe
    ],
    providers: [],
    exports: [
        TextOverflowPipe,
        CustomTimePipe,
        CustomDatePipe
    ]
})
export class CustomPipeModule {}