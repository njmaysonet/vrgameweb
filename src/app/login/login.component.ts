import {Component}  from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserLogin } from '../models/userLogin';

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
    submitted = false;

    constructor(private authService: AuthService){}

    onSubmit() {
        this.submitted = true;
    }
    
    login(username, password){
        this.authService.login(username, password);
    }
}