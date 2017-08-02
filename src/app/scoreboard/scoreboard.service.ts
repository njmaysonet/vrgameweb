import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Player } from '../models/player'

@Injectable()
export class ScoreboardService{
    private apiURL = 'http://localhost:3000/api/userinfo';
    private multiURL = 'http://localhost:3000/api/multiuser?userid=["1","4","8"]'

    constructor (private http: Http) {}

    getPlayers(): Observable<Player[]> {
        return this.http.get(this.multiURL)
            .map((res: Response) => res.json().players)
            .catch(this.handleError);
    }

    searchPlayers(term: string){
        let searchURL = 'http://localhost:3000/api/data/search';
        let params = new URLSearchParams();
        params.set('search',term);

        return this.http
            .get(searchURL, {search: params})
            .map(response => <Player[]> response.json());

    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if(error instanceof Response) {
            const body = error.json();
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        }else{
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
