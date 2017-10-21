import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

import { SignalRService } from './signal-r.service';
import { Untold } from '../models/backend-export';

@Injectable()
export class RealmHubListenerService {
  responseJoinRealm: Observable<Untold.UntoldResponse>;
  userJoined: Observable<Untold.UntoldResponse>;
  userLeft: Observable<Untold.UntoldResponse>;
  responseGetCurrentRealm: Observable<Untold.UntoldResponse>;
  responseLeaveRealm: Observable<Untold.UntoldResponse>;
  responseActivateMap: Observable<Untold.UntoldResponse>;
  responseUpdateMapGrid: Observable<Untold.UntoldResponse>;
  responseGetAllTokens: Observable<Untold.UntoldResponse>;
  responseUpdateToken: Observable<Untold.UntoldResponse>;
  responseCreateToken: Observable<Untold.UntoldResponse>;
  responseEntityPermissionChange: Observable<Untold.UntoldResponse>;
  responseEntityDataChange: Observable<Untold.UntoldResponse>;
  responseRealmTableDeleted: Observable<Untold.UntoldResponse>;
  responseRealmTableUpdate: Observable<Untold.UntoldResponse>;
  responseReloadRealmTableModules: Observable<Untold.UntoldResponse>;
  responseReloadRealmDefinitionModules: Observable<Untold.UntoldResponse>;
  responseClearLocalTableCache: Observable<Untold.UntoldResponse>;
  responseReloadSheets: Observable<Untold.UntoldResponse>;

  constructor(private signalRService: SignalRService) {
      const hub = this.signalRService.realmHub;

      this.responseJoinRealm = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseJoinRealm');
      this.responseGetCurrentRealm = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseGetCurrentRealm');
      this.responseLeaveRealm = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseLeaveRealm');
      this.responseActivateMap = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseActivateMap');
      this.responseUpdateMapGrid = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseUpdateMapGrid');
      this.userJoined = Observable.fromEvent<Untold.UntoldResponse>(hub, 'userJoined');
      this.userLeft = Observable.fromEvent<Untold.UntoldResponse>(hub, 'userLeft');
      this.responseGetAllTokens = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseGetAllTokens');
      this.responseUpdateToken = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseUpdateToken');
      this.responseCreateToken = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseCreateToken');
      this.responseEntityPermissionChange = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseEntityPermissionChange');
      this.responseEntityDataChange = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseEntityDataChange');
      this.responseRealmTableDeleted = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseRealmTableDeleted');
      this.responseRealmTableUpdate = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseRealmTableUpdate');
      this.responseReloadRealmTableModules = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseReloadRealmTableModules');
      this.responseReloadRealmDefinitionModules = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseReloadRealmDefinitionModules');
      this.responseClearLocalTableCache = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseClearLocalTableCache');
      this.responseReloadSheets = Observable.fromEvent<Untold.UntoldResponse>(hub, 'responseReloadSheets');
  }

}
