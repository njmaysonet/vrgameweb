import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Player } from './player'

@Injectable()
export class ScoreboardService{
    private apiURL = 'http://localhost:3000/api/data';

    constructor (private http: Http) {}

    getPlayers(): Observable<Player[]> {
        let players$ = this.http
        .get(this.apiURL)
        .map(this.mapPlayers);
        return players$;
    }

    private extractData(res: Response)
    {
        let body = res.json();
        return body.data || {};
    }

    private mapPlayers(res:Response): Player[]{
        return res.json().results.map(this.toPlayer);
    }

    private toPlayer(r:any): Player{
        let player = <Player>({
            id: r.id,
            name: r.name,
            title: r.title,
            currentLevel: r.currentLevel,
            totalCompletion: r.totalCompletion,
        });
        console.log('Parsed player:', player);
        return player;
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
