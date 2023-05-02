import { Component, OnInit } from '@angular/core';
import { faBell, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ICalendarAlert } from '../calendar.data';
import { ISlideFuncComponent, SlideAction } from './slide-func.data';

@Component({
    templateUrl: './alert-slide.component.html',
    styleUrls: ['./slide.style.css', './alert-slide.component.css']
})
export class AlertSlideComponent implements ISlideFuncComponent<{ alerts: ICalendarAlert[] }, any>, OnInit {
    onApprove?: (action: SlideAction, data?: any) => void;
    onReject?: (action: SlideAction, data?: any) => void;

    title?: string;
    action: SlideAction = SlideAction.Alert;
    data?: { alerts: ICalendarAlert[] };

    readonly ICON_BELL = faBell;
    readonly ICON_TRASH = faTrash;
    _alertList: ICalendarAlert[] = [];

    ngOnInit(): void {
        this._alertList = this.data?.alerts || [];
    }

    removeAlert(alert: ICalendarAlert): void {
        this._alertList.splice(this._alertList.indexOf(alert), 1);
    }

    closeAlertView(): void {
        this.onApprove?.(this.action);
    }
}