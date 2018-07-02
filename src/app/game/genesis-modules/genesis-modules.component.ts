import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { RealmHubSenderService } from '../../shared/services/realm-hub-sender.service';
import { GenesisDataService } from '../../shared/services/rest/genesis-data.service';
import { GameService } from '../../store/services/game.service';
import { RealmDefinitionService } from '../../store/services/realm-definition.service';
import { Untold } from '../../shared/models/backend-export';

@Component({
  selector: 'app-genesis-modules',
  templateUrl: './genesis-modules.component.html',
  styleUrls: ['./genesis-modules.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenesisModulesComponent implements OnDestroy {
  modules: Array<Untold.ClientModuleDefinitions>;
  selectedModule: Untold.ClientModuleDefinitions;
  createVisible: boolean;
  moduleName: string;
  private moduleSubscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private genesisDataService: GenesisDataService,
              private realmDefinitionService: RealmDefinitionService,
              private realmHubSenderService: RealmHubSenderService,
              private gameService: GameService) {
    this.moduleSubscription = this.realmDefinitionService.definitions.subscribe(realmDefinitions => {
      this.modules = realmDefinitions;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.moduleSubscription.unsubscribe();
  }

  showCreate() {
    this.createVisible = true;
    this.changeDetectorRef.markForCheck();
  }

  create() {
    this.genesisDataService.createModule({
      guid: '',
      id: 0,
      name: this.moduleName,
      realmId: this.gameService.getCurrent().realm.id,
      definitions: []
    }).subscribe(() => {
      const moduleReference: Untold.ClientModuleReference = {
        moduleId: 0,
        realmId: this.gameService.getCurrent().realm.id,
      };
      this.realmHubSenderService.reloadRealmDefinitionModules(moduleReference);
      this.moduleName = '';
      this.createVisible = false;

    });
  }

  deleteSelectedModule() {
    if (this.selectedModule) {
      this.genesisDataService.deleteModule(this.selectedModule.id).
        subscribe(() => {
          const moduleReference: Untold.ClientModuleReference = {
            moduleId: 0,
            realmId: this.gameService.getCurrent().realm.id,
          };

          this.realmHubSenderService.reloadRealmDefinitionModules(moduleReference);
        });
    }
  }

}
