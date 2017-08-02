import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { User } from '../models/user';
 
@Injectable()
export class AuthService {
    private currUser : User;
    private loginURL = 'http://localhost:3000/api/login';
    private logoutURL = 'http://localhost:3000/api/logout';

    constructor(private http: Http) {}
 
    login(username: string, password: string): Observable<boolean> {
        return this.http.post(this.loginURL, JSON.stringify({ username: username, password: password }))
            .map((response: Response) => {
                let user = response.json();
                if(user)
                {
                    // store username in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ username: username}));
                    // return true to indicate successful login
                    this.currUser = user;
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            });
    }
 
    logout(): void {
        // clear token remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.http.get(this.logoutURL)
            .map((res: Response) =>{
                let status = res.status;
                if(status == 200){
                    console.log("Logout successful.");
                }
                else{
                    console.log("Logout failed.");
                }
            });
    }

    signup(username: string, password: string): Observable<boolean>{
        return this.http.post('http://localhost:3000/api/login', JSON.stringify({USERNAME: username, PASSWORD: password}))
            .map((res: Response) => {
                let user = res.json();
                if(user){
                    //If user exists return true
                    return true;
                }
                else{
                    return false;
                }
            });
    }
}