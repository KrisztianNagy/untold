import { Injectable } from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable, Subject} from 'rxjs';
import { map, catchError, throw } from 'rxjs/operators';

import {AuthService} from '../../../shared/services/auth.service';

@Injectable()
export class WebApiService {
  errorSubject: Subject<string>;

  constructor(public http: Http,
              private authService: AuthService) {
                this.errorSubject = new Subject<string>();
  }

  get(path: string): Observable<string> {
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + this.authService.getAccessToken()
    });

    const options = new RequestOptions({ headers: headers });

    const observable = this.http.get(path, options).pipe(
      map(res => res.text()),
      catchError(err => this.handleError(err)));

    return observable;
  }

  delete(path: string): Observable<Response> {
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + this.authService.getAccessToken()
    });

    const options = new RequestOptions({ headers: headers });

    return this.http.delete(path, options);
  }

  post(path: string, data: any): Observable<Response> {
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.getAccessToken()
    });

    const options = new RequestOptions({
      headers: headers
    });

    return this.http.post(path, data, options)
    .pipe(catchError(err => this.handleError(err)));
  }

  put(path: string, data: any): Observable<Response> {
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.getAccessToken()
    });

    const options = new RequestOptions({
      headers: headers
    });

    return this.http.put(path, data, options)
      .pipe(catchError(err => this.handleError(err)));
  }

  private handleError(error: Response | any): Observable<any> {
    let shortMessage: string;
    let errMsg: string;

    if (error instanceof Response) {
      let body: any = '';
      try {
        body = error.json() || '';
      } catch (ex) {
      }

      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
      shortMessage = error.statusText || 'Error calling server.';
    } else {
      errMsg = error.message ? error.message : error.toString();
      shortMessage = error.message;
    }

    this.errorSubject.next(shortMessage);
    throw(errMsg);
  }
}
