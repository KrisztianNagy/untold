import { Injectable } from '@angular/core';

import { Token } from '../../../store/models/token';
import { LoadQueueService } from '../../../shared/services/load-queue.service';
import { RealmHubSenderService } from '../realm-hub-sender.service';
import { RealmHubListenerService } from '../realm-hub-listener.service';
import { GameService } from '../../../store/services/game.service';
import { GrowlService } from '../growl.service';
import { GridService } from '../../../store/services/grid.service';
import { TokenService } from '../../../store/services/token.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class GameWorkflowMapService {

  constructor(private gameService: GameService,
              private realmHubSenderService: RealmHubSenderService,
              private realmHubListenerService: RealmHubListenerService,
              private growlService: GrowlService,
              private gridService: GridService,
              private tokenService: TokenService,
              private loadQueueService: LoadQueueService) {
    this.realmHubListenerService.responseActivateMap.subscribe(ur => {
      this.mapChanged(ur.Data);
    });

    this.realmHubListenerService.responseUpdateMapGrid.subscribe(ur => {
      this.gridUpdated(ur.Data);
    });
  }

  public prepareTokens(map: Untold.ClientMap) {
    this.tokenService.resetTokens();
    this.loadQueueService.reset(this.gameService.getCurrent().accessSignature);

    if (map) {
      this.realmHubSenderService.getAllTokens(map.id);
    }
  }

  private mapChanged(map: Untold.ClientMap) {
    this.gameService.updateMemberMap(map, null);
    this.prepareTokens(map);

    if (map) {
      this.growlService.addInfo(map.name, 'Loaded');
    } else {
      this.growlService.addInfo('Leaving map', '');
    }
  }

  private gridUpdated(map: Untold.ClientMap) {
    this.gridService.loadTilesFromMaster(map.gridJson);
  }
}
