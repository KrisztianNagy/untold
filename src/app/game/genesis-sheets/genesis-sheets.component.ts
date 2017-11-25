import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/merge';

import { SelectItem } from 'primeng/primeng';
import { Inplace } from 'primeng/primeng';

import { Untold } from '../../shared/models/backend-export';
import { Sheet } from '../../store/models/sheet';
import { RealmDefinitionService } from '../../store/services/realm-definition.service';
import { SheetService } from '../../store/services/sheet.service';
import { GameWorkflowSheetService } from '../../shared/services/game-flow/game-workflow-sheet.service';

@Component({
  selector: 'app-genesis-sheets',
  templateUrl: './genesis-sheets.component.html',
  styleUrls: ['./genesis-sheets.component.scss']
})
export class GenesisSheetsComponent implements OnInit, OnDestroy {
  modules: Array<SelectItem>;
  selectedModule: Untold.ClientModuleDefinitions;
  sheets: Sheet[];
  editNameSheet: Sheet;
  private definitionSubscription;

  constructor(private realmDefinitionService: RealmDefinitionService,
              private changeDetectorRef: ChangeDetectorRef,
              private sheetService: SheetService,
              private gameWorkflowSheetService: GameWorkflowSheetService) {

  }

  ngOnInit() {
    this.sheets = [];

    this.definitionSubscription = this.realmDefinitionService.definitions
      .merge(this.sheetService.sheets)
      .subscribe(() => {
        const realmDefinitions = this.realmDefinitionService.getCurrent();
        this.editNameSheet = null;

        this.modules = realmDefinitions.map(rd => {
          return {
            label: rd.name,
            value: rd
          };
        });

        if (this.selectedModule) {
          const matching = realmDefinitions.filter(rt => rt.id === this.selectedModule.id);
          this.selectedModule = matching.length ? matching[0] : null;
          this.populateSheets();
        }

        if (!this.selectedModule && this.modules.length ) {
          this.selectedModule = this.modules[0].value;
          this.populateSheets();
        }

        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy() {
    this.definitionSubscription.unsubscribe();
  }

  moduleChanged() {
    this.populateSheets();
  }

  updateSheetName(sheet: Sheet) {
        this.gameWorkflowSheetService.saveSheetName(sheet);
  }

  deleteSheet(sheet: Sheet) {
    this.gameWorkflowSheetService.deleteSheet(sheet);
    this.populateSheets();
  }

  private populateSheets() {
    this.sheets = this.sheetService.getCurrent().filter(ent => ent.moduleGuid = this.selectedModule.guid);
    this.changeDetectorRef.markForCheck();
  }

  editName(sheet: Sheet) {
    this.editNameSheet = JSON.parse(JSON.stringify(sheet));
  }

  closeNameEditor(decision: boolean) {
    if (decision) {
      this.updateSheetName(this.editNameSheet);
    }

    this.editNameSheet = null;
  }
}
