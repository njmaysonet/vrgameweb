import { Component, OnInit, ViewChild } from '@angular/core';

import {AppMaterialModule} from './app-material.module';
import {MdMenuModule} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: "./app.component.html",
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'UCF Cultural VR Website';
}
