import { Component, OnInit } from '@angular/core';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { IAConfig, IALocalConfig } from '../../app-config.model';
import { CacheService } from '../../lib/cache.service';
import { ISlideFuncComponent, SlideAction } from './slide-func.data';

@Component({
    templateUrl: './local-config-slide.component.html',
    styleUrls: ['./slide.style.css', './local-config-slide.component.css',]
})
export class LocalConfigSlideComponent implements ISlideFuncComponent<{ config: IAConfig }, { config?: IAConfig, useLocalConfig?: boolean }>, OnInit {
    onApprove: (action: SlideAction, data?: { config?: IAConfig, useLocalConfig?: boolean }) => void;
    onReject: (action: SlideAction, data?: { config?: IAConfig, useLocalConfig?: boolean }) => void;

    title: string;
    action: SlideAction;
    data?: { config: IAConfig };

    readonly ICON_SLIDER = faSlidersH;
    readonly LANGUAGE_LIST: { key: string, name: string }[] = [
        {
            key: 'en-US',
            name: 'English (United States)'
        }, {
            key: 'zh-TW',
            name: '中文'
        },
        {
            key: 'fr-FR',
            name: 'français (France)'
        },
        {
            key: 'es-ES',
            name: 'español (España, alfabetización internacional)'
        }
    ];

    _useLocalConfig: boolean = false;
    _originUseLocalConfig: boolean = false;
    _editLocalConfig: IALocalConfig = new IALocalConfig();
    _originLocalConfig: IALocalConfig = new IALocalConfig();

    constructor(private cacheSvc: CacheService) { }

    ngOnInit(): void {
        this._useLocalConfig = this.cacheSvc.useLocalConfig;
        this._originUseLocalConfig = this.cacheSvc.useLocalConfig;
        this._editLocalConfig.merge(this.cacheSvc.localConfig);
        this._originLocalConfig.merge(this.cacheSvc.localConfig);

        if (this._editLocalConfig.isUnset()) {
            this._editLocalConfig.merge(this.data.config);
        }
        if (this._originLocalConfig.isUnset()) {
            this._originLocalConfig.merge(this.data.config);
        }
    }

    reset(): void {
        this._editLocalConfig.merge(this._originLocalConfig);
        this._useLocalConfig = this._originUseLocalConfig;
    }

    confirm(): void {
        this.onApprove(SlideAction.LocalConfig, { config: this._editLocalConfig, useLocalConfig: this._useLocalConfig });
    }
}