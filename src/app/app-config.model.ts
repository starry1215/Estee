/***************************************************
 * dateTimeOption:
 * {
 *     weekday: 'narrow' | 'short' | 'long',
 *     era: 'narrow' | 'short' | 'long',
 *     year: 'numeric' | '2-digit',
 *     month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
 *     day: 'numeric' | '2-digit',
 *     hour: 'numeric' | '2-digit',
 *     minute: 'numeric' | '2-digit',
 *     second: 'numeric' | '2-digit',
 *     timeZoneName: 'short' | 'long',
 * 
 *     // Time zone to express it in
 *     timeZone: 'Asia/Shanghai',
 *     // Force 12-hour or 24-hour
 *     hour12: true | false,
 * 
 *     // Rarely-used options
 *     hourCycle: 'h11' | 'h12' | 'h23' | 'h24', //not appear in es2015 interface
 *     formatMatcher: 'basic' | 'best fit'
 * }
 ******************************************************/

export interface IMerge<T> {
    merge(data: T): T;
}

export class IAConfig implements IMerge<IAConfig> {
    //version?: string;
    language?: string; //en-US
    dateTimeOption?: Intl.DateTimeFormatOptions;
    background?: string;
    logo?: string;
    theme?: {
        foreground?: string;
        availableColor?: string;
        occupiedColor?: string;
        timeline?: {
            bgColor?: string;
            futureEventTimeBlockColor?: string;
            currentEventTimeBlockColor?: string;
            expiredEventTimeBlockColor?: string;
        }
    };
    lightbar?: {
        available?: {
            mode?: string;
            color?: string;
        };
        busy?: {
            mode?: string;
            color?: string;
        }
    };
    calendar?: {
        enableOnsiteBooking?: boolean;
        enableFutureEventBooking?: boolean;
        allowFutureEventCancellation?: boolean;
        enableDateSwitch?: boolean;
        showQRCodeAlways?: boolean;

        msgPopupDuration?: number;
        minEventDuration?: number;
        timelineIdleDuration?: number;
        alertLimit?: number;
    };
    resource?: {
        bg?: {
            sizeLimit?: number;
            supportMimeTypes?: string[];
        },
        logo?: {
            sizeLimit?: number;
            supportMimeTypes?: string[];
        }
    }

    constructor(raw?: IAConfig) {
        //this.version = '';
        this.language = '';
        this.dateTimeOption = {};
        this.background = '';
        this.logo = '';
        this.theme = { timeline: {} };
        this.calendar = {};
        this.lightbar = { available: {}, busy: {} };
        this.resource = { bg: {}, logo: {} };

        if (raw) {
            this.merge(raw);
        }
    }

    isUnset(): boolean {
        return this.language === '';
    }

    merge(newConfig: IAConfig): IAConfig {
        if (!newConfig) {
            return this;
        }

        //this.version = newConfig.version || this.version;
        this.language = newConfig.language || this.language;
        this.background = newConfig.background || this.background;
        this.logo = newConfig.logo || this.logo;

        if (newConfig.dateTimeOption) {
            if (!this.dateTimeOption) {
                this.dateTimeOption = newConfig.dateTimeOption;
            }
            else {
                this.dateTimeOption.year = newConfig.dateTimeOption.year || this.dateTimeOption.year;
                this.dateTimeOption.month = newConfig.dateTimeOption.month || this.dateTimeOption.month;
                this.dateTimeOption.day = newConfig.dateTimeOption.day || this.dateTimeOption.day;
                this.dateTimeOption.weekday = newConfig.dateTimeOption.weekday || this.dateTimeOption.weekday;
                this.dateTimeOption.hour = newConfig.dateTimeOption.hour || this.dateTimeOption.hour;
                this.dateTimeOption.minute = newConfig.dateTimeOption.minute || this.dateTimeOption.minute;
                this.dateTimeOption.hour12 = newConfig.dateTimeOption.hour12 ?? this.dateTimeOption.hour12;
            }
        }

        if (newConfig.theme) {
            if (!this.theme) {
                this.theme = newConfig.theme;
            }
            else {
                this.theme.foreground = newConfig.theme.foreground || this.theme.foreground;
                this.theme.availableColor = newConfig.theme.availableColor || this.theme.availableColor;
                this.theme.occupiedColor = newConfig.theme.occupiedColor || this.theme.occupiedColor;

                if (newConfig.theme.timeline) {
                    if (!this.theme.timeline) {
                        this.theme.timeline = newConfig.theme.timeline;
                    }
                    else {
                        this.theme.timeline.bgColor = newConfig.theme.timeline.bgColor || this.theme.timeline.bgColor;
                        this.theme.timeline.currentEventTimeBlockColor = newConfig.theme.timeline.currentEventTimeBlockColor || this.theme.timeline.currentEventTimeBlockColor;
                        this.theme.timeline.expiredEventTimeBlockColor = newConfig.theme.timeline.expiredEventTimeBlockColor || this.theme.timeline.expiredEventTimeBlockColor;
                        this.theme.timeline.futureEventTimeBlockColor = newConfig.theme.timeline.futureEventTimeBlockColor || this.theme.timeline.futureEventTimeBlockColor;
                    }
                }
            }
        }

        if (newConfig.calendar) {
            if (!this.calendar) {
                this.calendar = newConfig.calendar;
            }
            else {
                this.calendar.enableFutureEventBooking = newConfig.calendar.enableFutureEventBooking ?? this.calendar.enableFutureEventBooking;
                this.calendar.allowFutureEventCancellation = newConfig.calendar.allowFutureEventCancellation ?? this.calendar.allowFutureEventCancellation;
                this.calendar.enableOnsiteBooking = newConfig.calendar.enableOnsiteBooking ?? this.calendar.enableOnsiteBooking;
                this.calendar.enableDateSwitch = newConfig.calendar.enableDateSwitch ?? this.calendar.enableDateSwitch;
                this.calendar.showQRCodeAlways = newConfig.calendar.showQRCodeAlways ?? this.calendar.showQRCodeAlways;
                this.calendar.msgPopupDuration = newConfig.calendar.msgPopupDuration || this.calendar.msgPopupDuration;
                this.calendar.minEventDuration = newConfig.calendar.minEventDuration || this.calendar.minEventDuration;
                this.calendar.timelineIdleDuration = newConfig.calendar.timelineIdleDuration || this.calendar.timelineIdleDuration;
                this.calendar.alertLimit = newConfig.calendar.alertLimit || this.calendar.alertLimit;
            }
        }

        if (newConfig.lightbar) {
            if (!this.lightbar) {
                this.lightbar = newConfig.lightbar;
            }
            else {
                if (newConfig.lightbar.available) {
                    if (!this.lightbar.available) {
                        this.lightbar.available = newConfig.lightbar.available;
                    }
                    else {
                        this.lightbar.available.color = newConfig.lightbar.available.color || this.lightbar.available.color;
                        this.lightbar.available.mode = newConfig.lightbar.available.mode || this.lightbar.available.mode;
                    }
                }
                if (newConfig.lightbar.busy) {
                    if (!this.lightbar.busy) {
                        this.lightbar.busy = newConfig.lightbar.busy;
                    }
                    else {
                        this.lightbar.busy.color = newConfig.lightbar.busy.color || this.lightbar.busy.color;
                        this.lightbar.busy.mode = newConfig.lightbar.busy.mode || this.lightbar.busy.mode;
                    }
                }
            }
        }

        if (newConfig.resource) {
            if (!this.resource) {
                this.resource = newConfig.resource;
            }
            else {
                if (newConfig.resource.bg) {
                    if (!this.resource.bg) {
                        this.resource.bg = newConfig.resource.bg;
                    }
                    else {
                        this.resource.bg.supportMimeTypes = newConfig.resource.bg.supportMimeTypes ?? this.resource.bg.supportMimeTypes;
                        this.resource.bg.sizeLimit = newConfig.resource.bg.sizeLimit || this.resource.bg.sizeLimit;
                    }
                }

                if (newConfig.resource.logo) {
                    if (!this.resource.logo) {
                        this.resource.logo = newConfig.resource.logo;
                    }
                    else {
                        this.resource.logo.supportMimeTypes = newConfig.resource.logo.supportMimeTypes ?? this.resource.logo.supportMimeTypes;
                        this.resource.logo.sizeLimit = newConfig.resource.logo.sizeLimit || this.resource.logo.sizeLimit;
                    }
                }
            }
        }

        return this;
    }
}

export class IALocalConfig extends IAConfig {
    override merge(newConfig: IALocalConfig): IALocalConfig {
        if (!newConfig) {
            return this;
        }

        //only merge required properties
        this.language = newConfig.language || this.language;
        if (newConfig.lightbar) {
            if (!this.lightbar) {
                this.lightbar = newConfig.lightbar;
            }
            else {
                if (newConfig.lightbar.available) {
                    if (!this.lightbar.available) {
                        this.lightbar.available = newConfig.lightbar.available;
                    }
                    else {
                        this.lightbar.available.color = newConfig.lightbar.available.color || this.lightbar.available.color;
                        this.lightbar.available.mode = newConfig.lightbar.available.mode || this.lightbar.available.mode;
                    }
                }
                if (newConfig.lightbar.busy) {
                    if (!this.lightbar.busy) {
                        this.lightbar.busy = newConfig.lightbar.busy;
                    }
                    else {
                        this.lightbar.busy.color = newConfig.lightbar.busy.color || this.lightbar.busy.color;
                        this.lightbar.busy.mode = newConfig.lightbar.busy.mode || this.lightbar.busy.mode;
                    }
                }
            }
        }

        if (newConfig.theme) {
            if (!this.theme) {
                this.theme = newConfig.theme;
            }
            else {
                this.theme.foreground = newConfig.theme.foreground || this.theme.foreground;
                this.theme.availableColor = newConfig.theme.availableColor || this.theme.availableColor;
                this.theme.occupiedColor = newConfig.theme.occupiedColor || this.theme.occupiedColor;

                if (newConfig.theme.timeline) {
                    if (!this.theme.timeline) {
                        this.theme.timeline = newConfig.theme.timeline;
                    }
                    else {
                        this.theme.timeline.bgColor = newConfig.theme.timeline.bgColor || this.theme.timeline.bgColor;
                        this.theme.timeline.currentEventTimeBlockColor = newConfig.theme.timeline.currentEventTimeBlockColor || this.theme.timeline.currentEventTimeBlockColor;
                        this.theme.timeline.expiredEventTimeBlockColor = newConfig.theme.timeline.expiredEventTimeBlockColor || this.theme.timeline.expiredEventTimeBlockColor;
                        this.theme.timeline.futureEventTimeBlockColor = newConfig.theme.timeline.futureEventTimeBlockColor || this.theme.timeline.futureEventTimeBlockColor;
                    }
                }
            }
        }

        return this;
    }
}