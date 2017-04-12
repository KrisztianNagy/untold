import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Response} from '@angular/http';

import {WebApiService} from './web-api.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class MapDataService {

  constructor(private webApiService: WebApiService) {

  }

  getMyCreatedMaps(realmId: number): Observable<Untold.ClientMap[]> {
    return this.webApiService.get('/api/map/created/' + realmId)
    .map(res => JSON.parse(res));
  }

  getMapById(id: number): Observable<Untold.ClientMap> {
    return this.webApiService.get('/api/map/' + id)
    .map(res => JSON.parse(res));
  }

  deleteMap(id: number): Observable<Response> {
    return this.webApiService.delete('/api/map/' + id);
  }

  saveMap(clientMap: Untold.ClientMap) {
    return this.webApiService.post('/api/map/save', clientMap);
  }

  createMap(clientMap: Untold.ClientMap) {
    return this.webApiService.post('/api/map/create', clientMap);
  }

}
