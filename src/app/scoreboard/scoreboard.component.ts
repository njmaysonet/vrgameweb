import { Component }    from    '@angular/core';
import { AppMaterialModule }  from    '../app-material.module';
import {Http, Response} from '@angular/http';
import {OnInit} from '@angular/core';

import {ScoreboardService} from './scoreboard.service';
import {Player} from '../models/player';

@Component({
    selector: 'scoreboard-component',
    templateUrl: './scoreboard.component.html',
    styleUrls: ['./scoreboard.component.css'],
    providers: [ScoreboardService]
})

export class ScoreboardComponent implements OnInit {
    errorMessage: string;
    players: Player[];
    searchResults: Player[] = new Array<Player>();
    mode = 'Observable';
    isChecked = true;
    searchTerm: string = null;

    constructor (private scoreboardService: ScoreboardService){}

    ngOnInit(){
        this.getPlayers();
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
                    this.searchResults[0] = player;
                }
            )
    }

    toggle(){
        this.isChecked = this.isChecked;
    }
}
