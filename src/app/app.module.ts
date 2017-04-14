//Imports needed for angular functionality
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule} from '@angular/material';

//Need hammerjs as dependency for some aspects of angular-material
import 'hammerjs';

//Components, Modules, and Services imports
import { AppComponent } from './app.component';
import { HomeComponent} from './home/home.component';
import { AppRoutingModule} from './routes/app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
