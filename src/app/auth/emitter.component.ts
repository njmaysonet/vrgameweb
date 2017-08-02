import { Injectable, EventEmitter } from "@angular/core";

@Injectable()
export class GlobalEventsManager{
    public showGuestMenu: EventEmitter<any> = new EventEmitter();
    public showUserMenu: EventEmitter<any> = new EventEmitter();
    public showAdminMenu: EventEmitter<any> = new EventEmitter();
}