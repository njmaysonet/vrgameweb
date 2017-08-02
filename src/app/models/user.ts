import {Scenarios} from './scenarios';
export interface User {
    USERID: number;
    USERNAME: string;
    FIRSTNAME: string;
    LASTNAME: string;
    EMAIL_ADDR: string;
    PASSWORD: string;
    PROFILE_PIC: string;
    BIRTHDAY: string;
    DATE_JOINED: string;
    ADMIN_STATUS: number;
    SCENARIOS: Scenarios[];
}