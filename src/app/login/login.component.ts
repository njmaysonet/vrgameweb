import {Component}  from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserLogin } from '../models/userLogin';
import { Router } from '@angular/router';

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
    user : UserLogin = new UserLogin();
    signedup = false;

    constructor(private authService: AuthService, 
                private router: Router){};

    onSubmit() {
        this.submitted = true;
        this.authService.login(this.user.username, this.user.password)
        .subscribe(res => {
            if(res == true){
                console.log("Logged in!");
                this.router.navigate(['/home']);
            } else {
                console.log("Login failed!");
                this.router.navigate(['/login']);
            }
        })
    }

    signup(){
        this.authService.signup(this.user.username, this.user.password)
            .subscribe(res => {
                if(res == true){
                    console.log("Signed Up!");
                    this.signedup = true;
                } else {
                    console.log("Sign up failed!");
                    
                }
            })
    }
}