import {Component}  from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [AuthService]
})

export class LoginComponent{
    private username : String;
    private password : String;
    private loggedIn : Boolean;

    constructor(private authService: AuthService){}
    
    login(username, password){
        this.authService.login(username, password);
    }
}