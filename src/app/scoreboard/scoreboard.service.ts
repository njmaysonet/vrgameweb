import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Player } from './player'

@Injectable()
export class ScoreboardService{
    private apiURL = 'http://localhost:3000/api/data';

    constructor (private http: Http) {}

    getPlayers(): Observable<Player[]> {
        return this.http.get(this.apiURL)
            .map((res: Response) => res.json().players)
            .catch(this.handleError);
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
