import { Component, Input, OnInit, EventEmitter, ChangeDetectionStrategy, ViewChild,trigger,state,transition,style,animate,Inject,forwardRef } from '@angular/core';
import {Router} from '@angular/router';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [
        trigger('menu', [
            state('hidden', style({
                height: '0px'
            })),
            state('visible', style({
                height: '*'
            })),
            transition('visible => hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('hidden => visible', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  active: boolean;

  constructor(private router: Router,
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
