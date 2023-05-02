import { Observable } from "rxjs";

export class Helper {
    
    static waitUntil(conditionFunc: () => boolean, checkInterval: number = 1000): Observable<void> {
        return new Observable(observer => {
            Helper.checkState(checkInterval, conditionFunc, () => {
                observer.next();
                observer.complete();
            })
        });
    }

    static checkState(interval: number = 1000, checkFunc: () => boolean, cb: () => void): void {
        if (checkFunc()) {
            return cb();
        }

        setTimeout(() => {
            Helper.checkState(interval, checkFunc, cb);
        }, interval);
    }

    static isPortrait(): boolean {
        return window.outerWidth < window.outerHeight;
    }

    static roundToFix(x: number, fix: number): number {
        let a: any = x + ("e+" + fix);
        return +(Math.round(a)  + ("e-" + fix));
    }

    static blobToBase64(blobData: Blob): Observable<string> {
        const reader = new FileReader();

        let stream = new Observable<string>(observer => {
            reader.onloadend = () => {
                let base64data = reader.result as string;
                observer.next(base64data);
                observer.complete();
            };

            reader.onerror = (err) => {
                observer.error(err);
                observer.complete();
            }

            return function () { }
        });

        reader.readAsDataURL(blobData);

        return stream;
    }

    static arrayToObjectWithNumberIndex(params: any[] = []): {[paramIndex: string]: any} {
        if (!params) {
            return {};
        }
        
        return params.reduce((a, v, i) => ({ ...a, [i]: v }), {});
    }
}