import { Injectable } from '@angular/core';
import { ICalendarAlert } from '../calendar.data';
import { AlertSlideComponent } from './alert-slide.component';
import { LocalConfigSlideComponent } from './local-config-slide.component';
import { SlideAction, SlideFuncItem } from './slide-func.data';

@Injectable()
export class SlideFuncService {
    private _funcs: SlideFuncItem<any>[] = [];

    get Funcs(): SlideFuncItem<any>[] {
        return this._funcs;
    }

    constructor() {
        this._funcs = [
            new SlideFuncItem<{ alerts: ICalendarAlert[] }>(AlertSlideComponent, SlideAction.Alert, 'lang.word.notification'),
            new SlideFuncItem<void>(LocalConfigSlideComponent, SlideAction.LocalConfig, 'lang.word.config')
        ];
    }

    getFunctionByAction<T>(action: SlideAction): SlideFuncItem<T> {
        return this._funcs.find(func => func.action === action);
    }
}