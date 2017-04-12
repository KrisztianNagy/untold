import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

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
export class GenesisModulesComponent implements OnInit {
  modules: Array<Untold.ClientModuleDefinitions>;
  selectedModule: Untold.ClientModuleDefinitions;
  createVisible: boolean;
  moduleName: string;
  private moduleSubscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private genesisDataService: GenesisDataService,
              private realmDefinitionService: RealmDefinitionService,
              private gameService: GameService) {
    this.moduleSubscription = this.realmDefinitionService.definitions.subscribe(realmDefinitions => {
      this.modules = realmDefinitions;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit() {
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
      this.moduleName = '';
      this.createVisible = false;
      // reload everything
    });
  }

  deleteSelectedModule() {
    if (this.selectedModule) {
      this.genesisDataService.deleteModule(this.selectedModule.id).
        subscribe(() => {
          // TODO: reload everything
        });
    }
  }

}
