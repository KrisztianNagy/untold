import { Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';

import { SignalRService } from './signal-r.service';
import { Untold } from '../models/backend-export';

@Injectable()
export class RealmHubSenderService {

  errorSubject: Subject<string>;

  constructor(private signalRService: SignalRService) {
    this.errorSubject = new Subject<string>();
  }

  private invoke(eventName: string, argEntity?: any): Observable<any> {
      const prom = argEntity ?
        this.signalRService.realmHub.invoke(eventName, argEntity).promise() :
        this.signalRService.realmHub.invoke(eventName).promise();

      const observable = from(prom);
      observable.subscribe(
        data => {},
        err => {
          this.errorSubject.next(err);
         (<any>window).appInsights.trackException(err);
        }
      );

      return from(<any> prom);
  }

  joinRealm(realmId: number): Observable<any> {
    return this.invoke('joinRealm', realmId);
  }

  getCurrentRealm(): Observable<any> {
    return this.invoke('getCurrentRealm');
  }

  leaveRealm(realmId: number): Observable<any> {
    return this.invoke('leaveRealm', realmId);
  }

  activateMap(userActiveMap: Untold.ClientUserActiveMap): Observable<any> {
    return this.invoke('activateMap', userActiveMap);
  }

  updateMapGrid(clientMap: Untold.ClientMap): Observable<any> {
    return this.invoke('updateMapGrid', clientMap);
  }

  getAllTokens(mapId: number): Observable<any> {
    return this.invoke('getAllTokens', mapId);
  }

  updateToken(clientToken: Untold.ClientToken): Observable<any> {
    return this.invoke('updateToken', clientToken);
  }

  createToken(clientToken: Untold.ClientToken): Observable<any> {
    return this.invoke('createToken', clientToken);
  }

  entityPermissionChange(clientEntityChange: Untold.ClientEntityChange): Observable<any> {
    return this.invoke('entityPermissionChange', clientEntityChange);
  }

  entityDataChange(clientEntityChange: Untold.ClientEntityChange): Observable<any> {
    return this.invoke('entityDataChange', clientEntityChange);
  }

  reloadEntities(realmId: number): Observable<any> {
    return this.invoke('reloadEntities', realmId);
  }

  realmTableDeleted(ruleTableReference: Untold.ClientRuleTableReference): Observable<any> {
    return this.invoke('realmTableDeleted', ruleTableReference);
  }

  realmTableUpdate(ruleTableReference: Untold.ClientRuleTableReference): Observable<any> {
    return this.invoke('realmTableUpdate', ruleTableReference);
  }

  reloadRealmTableModules(moduleReference: Untold.ClientModuleReference): Observable<any> {
    return this.invoke('reloadRealmTableModules', moduleReference);
  }

  reloadRealmDefinitionModules(moduleReference: Untold.ClientModuleReference): Observable<any> {
    return this.invoke('reloadRealmDefinitionModules', moduleReference);
  }

  clearLocalTableCache(ruleTableReference: Untold.ClientRuleTableReference): Observable<any> {
    return this.invoke('clearLocalTableCache', ruleTableReference);
  }

  reloadSheets(realmId: number): Observable<any> {
    return this.invoke('reloadSheets', realmId);
  }

  newMessage(realmId: number): Observable<any> {
    return this.invoke('newMessage', realmId);
  }
}
