import { Pipe, PipeTransform } from '@angular/core';
import { CacheService } from '../lib/cache.service';

@Pipe({
    name: 'pipeTime'
})
export class CustomTimePipe implements PipeTransform {

    constructor(private cacheSvc: CacheService) {
    }

    transform(value: Date, ...args: any[]): any {
        return this.cacheSvc.timeFormatter.format(value);
    }
}