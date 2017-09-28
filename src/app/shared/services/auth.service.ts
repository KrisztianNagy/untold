import { Injectable } from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Location } from '@angular/common';

// Avoid name not found warnings
declare var Auth0Lock: any;

@Injectable()
export class AuthService {
  userProfile: Object;
  lock = new Auth0Lock('3xRrx59vnaZWyZDbBGtuMFTtmbJhRJST', 'untold.eu.auth0.com', {});
  ready: AsyncSubject<boolean>;

  constructor(private location: Location) {
    this.ready = new AsyncSubject<boolean>();
    this.userProfile = JSON.parse(localStorage.getItem('profile'));

    const path = this.location.path(true);
    const isAuthenticationCallback = path.indexOf('access_token') !== -1;
    if (isAuthenticationCallback) {
      this.lock.on('authenticated', (authResult) => {
        localStorage.setItem('id_token', authResult.idToken);
        this.lock.hide();

        this.lock.getProfile(authResult.idToken, (error, profile) => {
          if (error) {
            // Handle error
            alert(error);
            return;
          }
          localStorage.setItem('profile', JSON.stringify(profile));
          this.userProfile = profile;
          this.ready.next(true);
          this.ready.complete();
        });
      });
    } else {
      this.ready.next(this.authenticated());
      this.ready.complete();
    }
  }

  public login() {
    // Call the show method to display the widget.
    this.lock.show();
  }

  public authenticated() {
    // Check if there's an unexpired JWT
    // This searches for an item in localStorage with key == 'id_token'
    return tokenNotExpired('id_token');

  }

  public logout() {
    // Remove token from localStorage
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    this.userProfile = undefined;
  }

  public getAccessToken() {
    return localStorage.getItem('id_token');
  }

}
