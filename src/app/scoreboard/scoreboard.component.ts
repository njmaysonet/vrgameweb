import { Component }    from    '@angular/core';
import { AppMaterialModule }  from    '../app-material.module';
import {Http, Response} from '@angular/http';
import {OnInit} from '@angular/core';

import {ScoreboardService} from './scoreboard.service';
import {Player} from './player';

@Component({
    selector: 'scoreboard-component',
    templateUrl: './scoreboard.component.html',
    styleUrls: ['./scoreboard.component.css'],
    providers: [ScoreboardService]
})

export class ScoreboardComponent implements OnInit {
    errorMessage: string;
    players: Player[];
    mode = 'Observable';

    constructor (private scoreboardService: ScoreboardService){}

    ngOnInit(){
        this.getPlayers();
    }

    getPlayers(){
        this.scoreboardService.getPlayers()
        .subscribe(
            players => {
                console.log(this.players);
                this.players = players;
            },
            error => this.errorMessage = <any>error
            );
    }
}
