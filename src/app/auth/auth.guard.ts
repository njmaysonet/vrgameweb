import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {GlobalEventsManager} from "../events/events.emitter";
import {User} from '../models/user';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private globalEventsManager: GlobalEventsManager){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
        if(localStorage.getItem('currentUser')){
            let user: User = JSON.parse(localStorage.getItem('currentUser'));
            console.log("User parsed!");
            if(user.ADMIN_STATUS == 2)
            {
                this.globalEventsManager.showAdminMenu.emit(true);
                this.globalEventsManager.showGuestMenu.emit(false);
            }
            else
            {
                this.globalEventsManager.showUserMenu.emit(true);
                this.globalEventsManager.showGuestMenu.emit(false);
            }
            return true;
        }
        this.router.navigate(['/login']);
        this.globalEventsManager.showGuestMenu.emit(true);
        return false;
    }
}