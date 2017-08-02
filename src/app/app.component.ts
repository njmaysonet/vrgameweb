import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import {AppMaterialModule} from './app-material.module';
import {MdMenuModule} from '@angular/material';
import {GlobalEventsManager} from './events/events.emitter';
import {AuthService} from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: "./app.component.html",
  styleUrls: ['./app.component.css'],
  providers: [AuthService]
})
export class AppComponent implements OnInit {
  title = 'UCF Cultural VR Website';
  showGuestMenu: boolean = true;
  showUserMenu: boolean = false;
  showAdminMenu: boolean = false;
  //Global Events Manager detects logins and signals the sidebar menu
  //to display different options based on the admin status of the user

  constructor(private router: Router, private authService: AuthService,
              private globalEventsManager: GlobalEventsManager){
                this.globalEventsManager.showAdminMenu.subscribe((mode: any) => {
                  this.showAdminMenu = mode;
                  if(this.showAdminMenu)
                  {
                    this.showGuestMenu = false;
                    this.showUserMenu = false;
                  }
                });
              
              this.globalEventsManager.showGuestMenu.subscribe((mode: any) => {
                this.showGuestMenu = mode;
                if(this.showGuestMenu){
                  this.showUserMenu = false;
                  this.showAdminMenu = false;
                }
              });
              
              this.globalEventsManager.showUserMenu.subscribe((mode: any) => {
                this.showUserMenu = mode;
                if(this.showUserMenu){
                  this.showAdminMenu = false;
                  this.showGuestMenu = false;
                }
              });
  };

  ngOnInit()
  { 
  }

  loginRedirect()
  {
    this.router.navigate(['/login']);
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
