import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {AppMaterialModule} from './app-material.module';
import {MdMenuModule} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: "./app.component.html",
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'UCF Cultural VR Website';

  constructor(private router: Router){};

  ngOnInit()
  { 
  }

  loginRedirect()
  {
    this.router.navigate(['/login'])
  }
}
