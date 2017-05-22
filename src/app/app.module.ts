//Imports needed for angular functionality
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule} from '@angular/material';
import { CommonModule } from '@angular/common';

//ngx-bootstrap modules
import { AlertModule } from 'ngx-bootstrap';
//import { DataTableModule } from 'angular-2-data-table';

//Need hammerjs as dependency for some aspects of angular-material
import 'hammerjs';

//Components, Modules, and Services imports
import { AppComponent } from './app.component';
import { HomeComponent} from './home/home.component';
import { AppRoutingModule} from './routes/app-routing.module';
import { DownloadsComponent} from './downloads/downloads.component';
import { AppMaterialModule } from './app-material.module';
import { ScoreboardComponent} from './scoreboard/scoreboard.component';
//import { ScoreboardRemote} from './scoreboard/scoreboard.remote';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DownloadsComponent,
    ScoreboardComponent
    //ScoreboardRemote
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    AppRoutingModule,
    AppMaterialModule,
    AlertModule.forRoot(),
    CommonModule,
    //DataTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
