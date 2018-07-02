import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Response} from '@angular/http';
import { map } from 'rxjs/operators';

import {WebApiService} from './web-api.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class RealmDataService {

  constructor(private webApiService: WebApiService) {

  }

  getMyCreatedRealms(): Observable<Untold.ClientRealm[]> {
    return this.webApiService.get('/api/realm/created')
      .pipe(map(res => JSON.parse(res)));
  }

  getMyPlayerRealms(): Observable<Untold.ClientUserRealmMembership[]> {
    return this.webApiService.get('/api/realm/player')
      .pipe(map(res => JSON.parse(res)));
  }

  getRealmById(id: number): Observable<Untold.ClientRealm> {
    return this.webApiService.get('/api/realm/' + id)
      .pipe(map(res => JSON.parse(res)));
  }

  deleteRealm(id: number): Observable<Response> {
    return this.webApiService.delete('/api/realm/' + id);
  }

  saveRealm(clientRealm: Untold.ClientRealm) {
    return this.webApiService.post('/api/realm/save', clientRealm);
  }

  createRealm(clientRealm: Untold.ClientRealm) {
    return this.webApiService.post('/api/realm/create', clientRealm);
  }

  joinApprove(id: number) {
    return this.webApiService.post('api/realm/request/approve', id);
  }

  joinReject(id: number) {
    return this.webApiService.post('api/realm/request/reject', id);
  }

  leave(id: number) {
    return this.webApiService.post('api/realm/request/leave', id);
  }
}
