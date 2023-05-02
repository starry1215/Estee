import { Type } from '@angular/core';

export class SlideFuncItem<T> {
    constructor(public component: Type<any>, public action: SlideAction, public title: string, public data?: T) { }
}

export interface ISlideFuncComponent<T, R> {
    title?: string;
    action: SlideAction;
    data?: T;

    onApprove?: (action: SlideAction, data?: R) => void;
    onReject?: (action: SlideAction, data?: R) => void;
}

export enum SlideAction {
    Alert,
    LocalConfig
}