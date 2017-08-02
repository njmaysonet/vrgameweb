import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { User } from '../models/user';
 
@Injectable()
export class AuthService {
    private currUser : User;
    private loginURL = 'http://localhost:3000/api/loginUser';
    private logoutURL = 'http://localhost:3000/api/logoutUser';
    private signupURL = 'http://localhost:3000/api/signupUser';

    constructor(private http: Http) {}
 
    login(username: string, password: string): Observable<boolean> {
        const headers = new Headers({'Content-Type':'application/x-www-form-urlencoded'});
        const options = new RequestOptions({headers: headers});
        let body = `username=${username}&password=${password}`;
        return this.http.post(this.loginURL, body, options)
            .map((response: Response) => {
                let user = response.json();
                if(user)
                {
                    // store username in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
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
        const headers = new Headers({'Content-Type':'application/x-www-form-urlencoded'});
        const options = new RequestOptions({headers: headers});
        let body = `username=${username}&password=${password}`;
        return this.http.post(this.signupURL, body, options)
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