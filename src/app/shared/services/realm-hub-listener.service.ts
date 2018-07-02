import { Injectable } from '@angular/core';
import { Observable, fromEvent} from 'rxjs';

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
  responseNewMessage: Observable<Untold.UntoldResponse>;
  responseReloadEntities: Observable<Untold.UntoldResponse>;

  constructor(private signalRService: SignalRService) {
      const hub = this.signalRService.realmHub;

      this.responseJoinRealm = fromEvent<Untold.UntoldResponse>(hub, 'responseJoinRealm');
      this.responseGetCurrentRealm = fromEvent<Untold.UntoldResponse>(hub, 'responseGetCurrentRealm');
      this.responseLeaveRealm = fromEvent<Untold.UntoldResponse>(hub, 'responseLeaveRealm');
      this.responseActivateMap = fromEvent<Untold.UntoldResponse>(hub, 'responseActivateMap');
      this.responseUpdateMapGrid = fromEvent<Untold.UntoldResponse>(hub, 'responseUpdateMapGrid');
      this.userJoined = fromEvent<Untold.UntoldResponse>(hub, 'userJoined');
      this.userLeft = fromEvent<Untold.UntoldResponse>(hub, 'userLeft');
      this.responseGetAllTokens = fromEvent<Untold.UntoldResponse>(hub, 'responseGetAllTokens');
      this.responseUpdateToken = fromEvent<Untold.UntoldResponse>(hub, 'responseUpdateToken');
      this.responseCreateToken = fromEvent<Untold.UntoldResponse>(hub, 'responseCreateToken');
      this.responseEntityPermissionChange = fromEvent<Untold.UntoldResponse>(hub, 'responseEntityPermissionChange');
      this.responseEntityDataChange = fromEvent<Untold.UntoldResponse>(hub, 'responseEntityDataChange');
      this.responseRealmTableDeleted = fromEvent<Untold.UntoldResponse>(hub, 'responseRealmTableDeleted');
      this.responseRealmTableUpdate = fromEvent<Untold.UntoldResponse>(hub, 'responseRealmTableUpdate');
      this.responseReloadRealmTableModules = fromEvent<Untold.UntoldResponse>(hub, 'responseReloadRealmTableModules');
      this.responseReloadRealmDefinitionModules = fromEvent<Untold.UntoldResponse>(hub, 'responseReloadRealmDefinitionModules');
      this.responseClearLocalTableCache = fromEvent<Untold.UntoldResponse>(hub, 'responseClearLocalTableCache');
      this.responseReloadSheets = fromEvent<Untold.UntoldResponse>(hub, 'responseReloadSheets');
      this.responseNewMessage = fromEvent<Untold.UntoldResponse>(hub, 'responseNewMessage');
      this.responseReloadEntities = fromEvent<Untold.UntoldResponse>(hub, 'responseReloadEntities');
  }

}
