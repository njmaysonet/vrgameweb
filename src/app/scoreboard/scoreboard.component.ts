import { Component }    from    '@angular/core';
import { AppMaterialModule }  from    '../app-material.module';
import {Http, Response} from '@angular/http';
import {OnInit} from '@angular/core';

import {ScoreboardService} from './scoreboard.service';
import {Player} from '../models/player';
import {User} from '../models/user';

@Component({
    selector: 'scoreboard-component',
    templateUrl: './scoreboard.component.html',
    styleUrls: ['./scoreboard.component.css'],
    providers: [ScoreboardService]
})

export class ScoreboardComponent implements OnInit {
    errorMessage: string;
    players: User[];
    searchResult: User;
    mode = 'Observable';
    isChecked = true;
    searchTerm: string = null;
    gotResult = false;

    constructor (private scoreboardService: ScoreboardService){}

    ngOnInit(){
        this.getPlayers();
        this.gotResult = false;
    }

    getPlayers(){
        this.scoreboardService.getPlayers()
            .subscribe(
                players => {
                    this.players = players;
                    console.log(players);
                },
                error => this.errorMessage = <any>error
                );
    }
    
    search(searchTerm){
        this.scoreboardService.searchPlayers(searchTerm)
            .subscribe(
                player => {
                    this.searchResult = player;
                    this.gotResult = true;
                }
            )
    }

    toggle(){
        this.isChecked = this.isChecked;
    }
}
