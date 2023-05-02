import { globalSetting } from './environment.global';

export const environment = {
    version: globalSetting.version,
    name: 'dev',
    production: false,
    auth: {
        tenantId: '9d1a9e7c-8506-4c34-b096-521e553baebe', //'6173c853-4dfa-49f2-aa9d-955fc70b5a9f',
        appId: '1c5dc5c2-27da-4ff6-bb0f-90ecae2ee7c7', //'3d1f9858-67a3-4230-8ffb-6e700565a790',
        redirectUri: 'http://localhost:4200'
    },
    system: {
        configRootFolder: "Estee",
        configFile: "config.json",
        lockByIAdea: false
    },
    config: {
        language: "en-US",
        dateTimeOption: {
            hour12: false,
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
            hour: "numeric",
            minute: "numeric"
        },
        background: "bg.jpg",
        logo: "logo.png",
        theme: {
            foreground: "#ffffff",
            availableColor: "#1cbf92",
            occupiedColor: "#af383d",
            timeline: {
                bgColor: "#ffffff",
                futureEventTimeBlockColor: "#dd595f",
                currentEventTimeBlockColor: "#af383d",
                expiredEventTimeBlockColor: "#6c757d"
            }
        },
        calendar: {
            enableOnsiteBooking: true,
            enableFutureEventBooking: true,
            allowFutureEventCancellation: true,
            enableDateSwitch: false,
            showQRCodeAlways: true,
            msgPopupDuration: 5000,
            minEventDuration: 15,
            timelineIdleDuration: 5,
            alertLimit: 10
        },
        lightbar: {
            available: {
                color: "#00ff00",
                mode: "on"
            },
            busy: {
                color: "#ff0000",
                mode: "on"
            }
        },
        resource: {
            bg: {
                sizeLimit: 2,
                supportMimeTypes: ["jpg", "jpeg", "png"]
            },
            logo: {
                sizeLimit: 0.5,
                supportMimeTypes: ["jpg", "jpeg", "png", "svg"]
            }
        }
    }
};
