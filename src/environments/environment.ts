// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  version: '',
  name: '',
  production: false,
  auth: {
    tenantId: '',
    appId: '',
    redirectUri: ''
  },
  system: {
    configRootFolder: "MeetingConnect",
    configFile: "Estee",
    lockByIAdea: true
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
      showQRCodeAlways: false,
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
