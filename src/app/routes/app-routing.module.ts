//Routing Module: Controls client side access of web app

//Angular Imports
import {NgModule}   from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

//Component imports
import {HomeComponent} from '../home/home.component';
import {DownloadsComponent} from '../downloads/downloads.component';
import {ScoreboardComponent} from '../scoreboard/scoreboard.component';
import {AboutComponent} from '../about/about.component';
import {LoginComponent} from '../login/login.component';
import {AppComponent} from '../app.component';
//Services
import {AuthGuard} from '../auth/auth.guard';

//Array containing routing information and directives
const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'app-root', component: AppComponent, canActivate: [AuthGuard]},
    {path: 'home', component: HomeComponent},
    {path: 'downloads', component: DownloadsComponent},
    {path: 'scoreboard', component: ScoreboardComponent},
    {path: 'about', component: AboutComponent},
    {path: 'login', component: LoginComponent, canActivate: [AuthGuard]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule{}