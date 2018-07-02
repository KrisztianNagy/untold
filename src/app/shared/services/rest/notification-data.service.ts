import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';

import {WebApiService} from './web-api.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class NotificationDataService {

  constructor(private webApiService: WebApiService) {

  }

  getPagedNotifications(pageNum: number): Observable<Untold.ClientPagedNotifications> {
    return this.webApiService.get('/api/notification/' + pageNum)
    .pipe(map(res => JSON.parse(res)));
  }

  getRecentNotifications(): Observable<Untold.ClientRecentNotifications> {
    return this.webApiService.get('/api/notification/recent')
    .pipe(map(res => JSON.parse(res)));
  }

  readNotification(notificationId: number) {
    return this.webApiService.post('api/notification/read', notificationId);
  }

  deleteNotification(notificationId: number) {
    return this.webApiService.delete('api/notification/' + notificationId);
  }
}
