import { Component, Input, OnInit, Inject, forwardRef } from '@angular/core';
import {Router} from '@angular/router';

import {AppComponent} from '../app.component';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
 
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  active: boolean;

  constructor(@Inject(forwardRef(() => AppComponent)) public app: AppComponent,
              private router: Router,
              private authService: AuthService) { }

  ngOnInit() {
  }

  onClick(event) {
    this.active = !this.active;
    event.preventDefault();
  }

  logout() {
    this.authService.logout();
    window.location.href = '/';
  }

}
