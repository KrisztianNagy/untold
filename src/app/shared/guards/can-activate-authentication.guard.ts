import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import {Observable} from 'rxjs/Observable';

import { AuthService } from '../services/auth.service';

@Injectable()
export class CanActivateAuthenticationGuard implements CanActivate {

  constructor(private router: Router,
              private location: Location,
              private authService: AuthService) { }

  canActivate(): boolean {
    const path = this.location.path(true);

    // You may want to make a more robust check here
    const isAuthenticationCallback = path.indexOf('access_token') !== -1;

    if (isAuthenticationCallback) {
      this.router.navigate(['realms'], { fragment: path });

      return false;
    }

    return true;
  }
}
