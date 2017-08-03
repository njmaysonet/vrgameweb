import {Component, OnInit}  from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserLogin } from '../models/userLogin';
import { Router } from '@angular/router';
import { User } from '../models/user';

@Component({
    selector: 'profile',
    template: 'profile.component.html',
    styleUrls: ['profile.component.css']
})

export class ProfileComponent implements OnInit{
    user: User;

    constructor(private authService: AuthService){};

    ngOnInit(){
        this.user = this.authService.getUser();
        if(!this.user){
            console.log("Profile Error: No user.");
        }
    }

}