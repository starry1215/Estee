import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'pipeTextOverflow'
})
export class TextOverflowPipe implements PipeTransform {
    transform(value: string, ...args: any[]): any {
        return value.length <= args[0] ? value : value.substring(0, args[0]) + '...';
    }
}