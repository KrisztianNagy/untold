import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/Subject';
import { AuthService } from '../../shared/services/auth.service';


@Injectable()
export class SignalRService {
  realmHub: SignalR.Hub.Proxy;
  connectionSubject: Subject<boolean>;
  private connection: SignalR.Hub.Connection;
  private started: boolean;

  constructor(private authService: AuthService) {
    this.connectionSubject = new Subject<boolean>();
    this.connection = (<any> $).hubConnection('/signalr');

    this.realmHub = this.connection.createHubProxy('realmHub');

    if (this.authService.authenticated()) {
      this.useBearerToken(this.authService.getAccessToken());
    } else {
      this.authService.ready.subscribe(() => {
          this.useBearerToken(this.authService.getAccessToken());
      });
    }

    this.connection.disconnected(() => {
      console.log('Disconnected');
      this.connectionSubject.next(false);

      setTimeout(() => {
        console.log('Trying to reconnect');
        this.start();
      }, 5000);
    });
  }

  start(): void {
    if (this.started) {
        return;
    }

  this.connectionSubject.next(false);
  this.connection.start()
    .done(() => {
        this.started = true;
        this.connectionSubject.next(true);
    })
    .fail(() => {
      console.log('Could not start SignalR connection');
      this.connectionSubject.next(false);

      setTimeout(() => {
        this.start();
      }, 5000);
    });
  }

  stop(): void {
    if (!this.started) {
        return;
    }

    this.connection.stop();
    this.started = false;
  }

  useBearerToken(token: string) {
    this.stop();
    this.setTokenCookie(token);
    this.start();
  };

  setTokenCookie(token: string) {
    if (token) {
        document.cookie = 'BearerToken=' + token + '; path=/';
    }
  }

  clearAuthentication(restart: boolean): void {
    this.stop();

    if (restart) {
      document.cookie = 'BearerToken=; path=/; expires=' + new Date(0).toUTCString();
      this.start();
    }
  }
}
