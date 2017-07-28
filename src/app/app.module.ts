//Imports needed for angular functionality
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { MaterialModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule} from '@angular/flex-layout';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

//ngx-bootstrap modules

//Need hammerjs as dependency for some aspects of angular-material
import 'hammerjs';

//Components, Modules, and Services imports
import { AppComponent } from './app.component';
import { HomeComponent} from './home/home.component';
import { AppRoutingModule} from './routes/app-routing.module';
import { DownloadsComponent} from './downloads/downloads.component';
import { AppMaterialModule } from './app-material.module';
import { ScoreboardComponent} from './scoreboard/scoreboard.component';
import { AboutComponent} from './about/about.component';
import { LoginComponent} from './login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
//import { ScoreboardRemote} from './scoreboard/scoreboard.remote';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DownloadsComponent,
    ScoreboardComponent,
    AboutComponent,
    LoginComponent
    //ScoreboardRemote
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    MaterialModule,
    AppRoutingModule,
    AppMaterialModule,
    //AlertModule.forRoot(),
    CommonModule,
    //DataTableModule
    FlexLayoutModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
