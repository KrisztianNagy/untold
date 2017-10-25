import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { GameService } from '../../../store/services/game.service';
import { RealmTableService } from '../../../store/services/realm-table.service';
import { RealmDefinitionService } from '../../../store/services/realm-definition.service';
import { EntityService } from '../../../store/services/entity.service';
import { RealmHubSenderService } from '../realm-hub-sender.service';
import { RealmHubListenerService } from '../realm-hub-listener.service';
import { GrowlService } from '../growl.service';
import { Untold } from '../../models/backend-export';
import { GridService } from '../../../store/services/grid.service';
import { TokenService } from '../../../store/services/token.service';
import { Token } from '../../../store/models/token';
import { LoadQueueService } from '../../../shared/services/load-queue.service';
import { GenesisDataService } from '../../../shared/services/rest/genesis-data.service';
import { GameWorkflowRealmService } from './game-workflow-realm.service';
import { GameWorkflowMapService } from './game-workflow-map.service';
import { GameWorkflowChatService } from './game-workflow-chat.service';
import { GameWorkflowSheetService } from './game-workflow-sheet.service';
import { GameWorkflowEntityService } from './game-workflow-entity.service';

@Injectable()
export class GameWorkflowService {

  constructor(private router: Router,
              private gameService: GameService,
              private realmHubSenderService: RealmHubSenderService,
              private realmHubListenerService: RealmHubListenerService,
              private growlService: GrowlService,
              private gridService: GridService,
              private tokenService: TokenService,
              private loadQueueService: LoadQueueService,
              private genesisDataService: GenesisDataService,
              private realmTableService: RealmTableService,
              private realmDefinitionService: RealmDefinitionService,
              private entityService: EntityService,
              private gameWorkflowRealmService: GameWorkflowRealmService,
              private gameWorkflowMapService: GameWorkflowMapService,
              private gameWorkflowChatService: GameWorkflowChatService,
              private gameWorkflowSheetService: GameWorkflowSheetService,
              private gameWorkflowEntityService: GameWorkflowEntityService) {

    this.realmHubListenerService.responseCreateToken.subscribe(ur => {
      this.tokenService.addToLocalStore([ur.Data]);
    });

    this.realmHubListenerService.responseGetAllTokens.subscribe(ur => {
      this.tokenService.addToLocalStore(ur.Data);
    });

    this.realmHubListenerService.responseUpdateToken.subscribe(ur => {
      const parsed = JSON.parse(ur.Data.data);
      this.tokenService.updateToken(parsed, false);
    });

    this.tokenService.tokens.subscribe(tokens => {
      this.checkdefaultToken(tokens);
    });
  }

  private checkdefaultToken(tokens: Array<Token>) {
   const currentSelected = this.tokenService.getCurrentSelectedToken();
   const game = this.gameService.getCurrent();

   if (!currentSelected || !currentSelected.id) {
     const related = tokens.filter(token => {
       return game.realm.isCurrentUserOwner || (token.owner && token.owner.id === game.localMembership.user.id);
     });

     if (related.length) {
       this.tokenService.selectTokenById(related[0].id);
     } else {
       this.tokenService.selectTokenById(null);
     }
   }
  }
}
