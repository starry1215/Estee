
import { environment } from '../environments/environment';
export const OAuthSettings = {
    authority: `https://login.microsoftonline.com/common`, //`https://login.microsoftonline.com/common`,
    scopes: [
        "user.read",
        "calendars.readwrite",
        "calendars.read",
        "files.read.all",
        "Sites.Read.All",
        "calendars.read.shared",
        "calendars.readwrite.shared"
        //"Mail.Read"
    ],
    apiBaseUrl: 'https://graph.microsoft.com/v1.0/'
};

export const PERSONAL_TENANTID: string = '9188040d-6c67-4c5b-b112-36a304b66dad';