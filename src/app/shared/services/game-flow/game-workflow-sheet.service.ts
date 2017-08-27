import { Injectable } from '@angular/core';

import { Untold } from '../../models/backend-export';
import { GenesisDataService } from '../../../shared/services/rest/genesis-data.service';
import { SheetEnhancerService } from '../../../shared/services/expressions/sheet-enhancer.service';
import { GameService } from '../../../store/services/game.service';
import { Sheet } from '../../../store/models/sheet';
import { SheetService } from '../../../store/services/sheet.service';

@Injectable()
export class GameWorkflowSheetService {

  constructor(private genesisDataService: GenesisDataService,
              private gameService: GameService,
              private sheetEnhancerService: SheetEnhancerService,
              private sheetService: SheetService) { }

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

      const reponseSheet = JSON.parse(response.json());
        this.sheetService.addSheet(reponseSheet);
        // TODO: Notify other users
    });
  }

  saveSheetContent(sheet: Sheet) {
    this.sheetEnhancerService.saveSheetContent(sheet, this.gameService.getCurrent().realm)
      .subscribe(() => {
        this.sheetService.updateSheet(sheet);
        // TODO: Notify other users
      });
  }

  saveSheetName(sheet: Sheet) {
    const clientSheet = this.sheetEnhancerService.getClientSheet(sheet);

    this.genesisDataService.saveSheet(this.gameService.getCurrent().realm.id, clientSheet)
    .subscribe(() => {
      this.sheetService.updateSheet(sheet);
      // TODO: Notify other users
    });
  }

  deleteSheet(sheet: Sheet) {
    this.genesisDataService.deleteSheet( sheet.id)
    .subscribe(() => {
      this.sheetEnhancerService.deleteSheet(sheet, this.gameService.getCurrent().realm)
      .subscribe(() => {
        this.sheetService.deleteSheet(sheet);
      // TODO: Notify other users
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
