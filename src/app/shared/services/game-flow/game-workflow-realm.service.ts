import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { RealmHubSenderService } from '../realm-hub-sender.service';
import { RealmHubListenerService } from '../realm-hub-listener.service';
import { GameService } from '../../../store/services/game.service';
import { GameWorkflowMapService } from './game-workflow-map.service';
import { GameWorkflowEntityService } from './game-workflow-entity.service';
import { GameWorkflowSheetService } from './game-workflow-sheet.service';
import { GenesisDataService } from '../../../shared/services/rest/genesis-data.service';
import { RealmTableService } from '../../../store/services/realm-table.service';
import { RealmDefinitionService } from '../../../store/services/realm-definition.service';
import { EntityService } from '../../../store/services/entity.service';
import { SheetService } from '../../../store/services/sheet.service';
import { GrowlService } from '../growl.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class GameWorkflowRealmService {

  constructor(private router: Router,
              private gameService: GameService,
              private growlService: GrowlService,
              private realmHubSenderService: RealmHubSenderService,
              private realmHubListenerService: RealmHubListenerService,
              private gameWorkflowMapService: GameWorkflowMapService,
              private gameWorkflowEntityService: GameWorkflowEntityService,
              private genesisDataService: GenesisDataService,
              private realmTableService: RealmTableService,
              private realmDefinitionService: RealmDefinitionService,
              private entityService: EntityService,
              private gameWorkflowSheetService: GameWorkflowSheetService) {
    this.realmHubListenerService.responseJoinRealm.subscribe(rm => {
      this.currentUserJoinsRealm(rm.Data);
    });

    this.realmHubListenerService.userJoined.subscribe(ur => {
      this.someoneJoinedRealm(ur.Data);
    });

    this.realmHubListenerService.userLeft.subscribe(ur => {
      this.someoneLeftRealm(ur.Data);
    });

    this.realmHubListenerService.responseLeaveRealm
      .subscribe(rm => {
        this.router.navigateByUrl('').then(() => {
          this.leaveGame();
        });
    });

    this.realmHubListenerService.responseRealmTableDeleted.subscribe(rr => {
      this.realmTableDeleted(rr.Data);
    });

    this.realmHubListenerService.responseReloadRealmTableModules.subscribe(rr => {
      this.reloadModuleTables();
    });

    this.realmHubListenerService.responseReloadRealmDefinitionModules.subscribe(rr => {
      this.reloadModuleDefinitions(rr.Data);
    });
  }

  private currentUserJoinsRealm(game: Untold.ClientGameRealmDetails) {
    this.gameService.selectGame(game);
    this.gameWorkflowMapService.prepareTokens(game.localMembership.activeMap);

    this.genesisDataService.getRuleTablesByRealm(game.realm.id).subscribe(rt => {
      this.realmTableService.updateRealmTables(rt.moduleTables);

      this.genesisDataService.getDefinitionsByRealm(game.realm.id).subscribe(rd => {
        this.realmDefinitionService.setDefinitions(rd.moduleDefinitions);

        if (game.realm.isCurrentUserOwner) {
          this.genesisDataService.getOwnerEntities(game.realm.id).subscribe(res => {
            res.forEach(ent => {
              this.gameWorkflowEntityService.setCalculatedEntity(ent);
            });
          });
        } else {
          this.genesisDataService.getPlayerEntities(game.realm.id).subscribe(res => {
            res.forEach(ent => {
              this.gameWorkflowEntityService.setCalculatedEntity(ent);
            });
          });
        }

        this.genesisDataService.getSheetsByRealm(game.realm.id).subscribe(sheets => {
          sheets.forEach(sheet => {
            this.gameWorkflowSheetService.setEnhancedSheet(sheet);
          });
        });
      });
    });

    this.growlService.addSuccess(game.realm.name, 'Game started');
  }

  private someoneJoinedRealm(user: Untold.ClientUser) {
    this.gameService.updateUserStatus(user.userName, true);
    this.growlService.addInfo(user.displayName, 'Joined');
  }

   private someoneLeftRealm(user: Untold.ClientUser) {
    this.gameService.updateUserStatus(user.userName, false);
    this.growlService.addInfo(user.displayName, 'Left');
  }

  private leaveGame() {
    this.gameService.selectGame(null);
  }

  private realmTableDeleted(realmTableReference: Untold.ClientRuleTableReference) {
    this.realmTableService.deleteRealmTable(realmTableReference);
  }

  private reloadModuleTables() {
    this.genesisDataService.getRuleTablesByRealm(this.gameService.getCurrent().realm.id).subscribe(rt => {
      this.realmTableService.updateRealmTables(rt.moduleTables);
    });
  }

  private reloadModuleDefinitions(realmDefinition: Untold.ClientDefinitionReference) {
     this.genesisDataService.getDefinitionsByRealm(this.gameService.getCurrent().realm.id).subscribe(rd => {
      this.realmDefinitionService.setDefinitions(rd.moduleDefinitions);
     });
  }
}
