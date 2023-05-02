import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { IAConfig } from './app-config.model';

@Injectable()
export class AppConfigService {
    static config: IAConfig = new IAConfig();

    constructor() { }

    load() {
        return new Promise<void>((resolve, reject) => {
            AppConfigService.config.merge(environment.config as IAConfig);
            resolve();
        });
    }
}