import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {GlobalEventsManager} from "./emitter.component";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private globalEventsManager: GlobalEventsManager){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
        if(localStorage.getItem('currentUser')){
            return true;
        }
        this.router.navigate(['/login'], {queryParams:{returnUrl: state.url}});
        return false;
    }
}