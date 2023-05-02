import { Pipe, PipeTransform } from '@angular/core';
import { CacheService } from '../lib/cache.service';

@Pipe({
    name: 'pipeDate'
})
export class CustomDatePipe implements PipeTransform {

    constructor(private cacheSvc: CacheService) {
    }

    transform(value: Date, ...args: any[]): any {
        return this.cacheSvc.dateFormatter?.format(value);
    }
}