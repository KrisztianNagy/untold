import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Response} from '@angular/http';

import {WebApiService} from './web-api.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class NotificationDataService {

  constructor(private webApiService: WebApiService) {

  }

  getPagedNotifications(pageNum: number): Observable<Untold.ClientPagedNotifications> {
    return this.webApiService.get('/api/notification/' + pageNum)
    .map(res => JSON.parse(res));
  }

  getRecentNotifications(): Observable<Untold.ClientRecentNotifications> {
    return this.webApiService.get('/api/notification/recent')
    .map(res => JSON.parse(res));
  }

  readNotification(notificationId: number) {
    return this.webApiService.post('api/notification/read', notificationId);
  }

  deleteNotification(notificationId: number) {
    return this.webApiService.delete('api/notification/' + notificationId);
  }
}
