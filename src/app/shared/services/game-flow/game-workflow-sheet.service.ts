import { Injectable } from '@angular/core';

import { RealmHubSenderService } from '../realm-hub-sender.service';
import { RealmHubListenerService } from '../realm-hub-listener.service';
import { Untold } from '../../models/backend-export';
import { GenesisDataService } from '../../../shared/services/rest/genesis-data.service';
import { SheetEnhancerService } from '../../../shared/services/expressions/sheet-enhancer.service';
import { GameService } from '../../../store/services/game.service';
import { Sheet } from '../../../store/models/sheet';
import { SheetService } from '../../../store/services/sheet.service';
import { GrowlService } from '../growl.service';

@Injectable()
export class GameWorkflowSheetService {

  constructor(private genesisDataService: GenesisDataService,
              private gameService: GameService,
              private realmHubSenderService: RealmHubSenderService,
              private realmHubListenerService: RealmHubListenerService,
              private sheetEnhancerService: SheetEnhancerService,
              private growlService: GrowlService,
              private sheetService: SheetService) {
    this.realmHubListenerService.responseReloadSheets.subscribe(resp => {
      this.loadSheets();
    });
  }

  createSheet(definition: Untold.ClientDefinition) {

    const sheet: Untold.ClientSheet = {
      definition: null,
      definitionGuid: definition.definitionGuid,
      id: 0,
      moduleGuid: definition.moduleGuid,
      name: definition.name + ' sheet'
    };

    this.genesisDataService.createSheet(this.gameService.getCurrent().realm.id, sheet)
    .subscribe(response => {
      const responseSheetId = JSON.parse(response.json());
      sheet.id = responseSheetId;
      this.setEnhancedSheet(sheet);
      this.realmHubSenderService.reloadSheets(this.gameService.getCurrent().realm.id);
      this.growlService.addInfo('Sheet', 'The sheet have been created. Visit the sheets page.');
    });
  }

  loadSheets() {
    this.sheetService.setSheets([]);
    this.genesisDataService.getSheetsByRealm(this.gameService.getCurrent().realm.id).subscribe(sheets => {
      this.growlService.addInfo('Sheets', 'The sheet list have been updated');
      sheets.forEach(sheet => {
        this.setEnhancedSheet(sheet);
      });
    });
  }

  saveSheetContent(sheet: Sheet) {
    this.sheetEnhancerService.saveSheetContent(sheet, this.gameService.getCurrent().realm)
      .subscribe(() => {
        this.sheetService.updateSheet(sheet);
        this.realmHubSenderService.reloadSheets(this.gameService.getCurrent().realm.id);
        this.growlService.addInfo('Sheet', 'The sheet have been updated');
      });
  }

  saveSheetName(sheet: Sheet) {
    const clientSheet = this.sheetEnhancerService.getClientSheet(sheet);

    this.genesisDataService.saveSheet(this.gameService.getCurrent().realm.id, clientSheet)
    .subscribe(() => {
      this.sheetService.updateSheet(sheet);
      this.realmHubSenderService.reloadSheets(this.gameService.getCurrent().realm.id);
      this.growlService.addInfo('Sheet', 'The sheet have been updated');
    });
  }

  deleteSheet(sheet: Sheet) {
    this.genesisDataService.deleteSheet( sheet.id)
    .subscribe(() => {
      this.sheetEnhancerService.deleteSheet(sheet, this.gameService.getCurrent().realm)
      .subscribe(() => {
        this.sheetService.deleteSheet(sheet);
        this.realmHubSenderService.reloadSheets(this.gameService.getCurrent().realm.id);
        this.growlService.addInfo('Sheet', 'The sheet have been deleted');
      });
    });
  }

  public setEnhancedSheet(sheet: Untold.ClientSheet) {
    this.sheetEnhancerService.loadSheet(sheet, this.gameService.getCurrent().realm)
    .subscribe(loadedSheet => {
        this.sheetService.addSheet(loadedSheet);
    });
  }
}
