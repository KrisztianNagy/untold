import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/merge';

import { SelectItem } from 'primeng/primeng';
import { Inplace } from 'primeng/primeng';
import { DialogModule } from 'primeng/primeng';

import { Untold } from '../../shared/models/backend-export';
import { RealmDefinitionService } from '../../store/services/realm-definition.service';
import { EntityService } from '../../store/services/entity.service';
import { SheetService } from '../../store/services/sheet.service';
import { GameWorkflowEntityService } from '../../shared/services/game-flow/game-workflow-entity.service';
import { DefinitionEnhancerService } from '../../shared/services/expressions/definition-enhancer.service';

@Component({
  selector: 'app-genesis-entities',
  templateUrl: './genesis-entities.component.html',
  styleUrls: ['./genesis-entities.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenesisEntitiesComponent implements OnInit, OnDestroy {
  modules: Array<SelectItem>;
  selectedModule: Untold.ClientModuleDefinitions;
  selectedEntity: Untold.ClientEntity;
  entities: Untold.ClientEntity[];
  sheetNames: object;
  sheets: Untold.ClientSheet[];
  availableSheets: Array<SelectItem>;
  selectedSheetId: number;
  displaySheetPicker: boolean;
  editNameEntity: Untold.ClientEntity;
  private definitionSubscription;

  constructor(private realmDefinitionService: RealmDefinitionService,
              private changeDetectorRef: ChangeDetectorRef,
              private entityService: EntityService,
              private sheetService: SheetService,
              private gameWorkflowEntityService: GameWorkflowEntityService,
              private definitionEnhancerService: DefinitionEnhancerService) {

  }

  ngOnInit() {
    this.entities = [];
    this.sheets = [];
    this.sheetNames = {};
    this.selectedSheetId = 0;

    this.definitionSubscription = this.realmDefinitionService.definitions
      .merge(this.entityService.entities)
      .merge(this.sheetService.sheets)
      .subscribe(() => {
        this.editNameEntity = null;
        const realmDefinitions = this.realmDefinitionService.getCurrent();
        this.modules = realmDefinitions.map(rd => {
          return {
            label: rd.name,
            value: rd
          };
        });

        if (this.selectedModule) {
          const matching = realmDefinitions.filter(rt => rt.id === this.selectedModule.id);
          this.selectedModule = matching.length ? matching[0] : null;
          this.populateEntities();
          this.populateSheets();
        }

        if (!this.selectedModule && this.modules.length ) {
          this.selectedModule = this.modules[0].value;
          this.populateEntities();
          this.populateSheets();
        }

        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy() {
    this.definitionSubscription.unsubscribe();
  }

  moduleChanged() {
    this.populateEntities();
    this.populateSheets();
  }

  updateEntityName(entity: Untold.ClientEntity) {
      this.gameWorkflowEntityService.saveEntityName(entity);
  }

  deleteEntity(entity: Untold.ClientEntity) {
    this.gameWorkflowEntityService.deleteEntity(entity);
    this.populateEntities();
  }

  private populateEntities() {
    this.entities = this.entityService.getCurrent().filter(ent => ent.moduleGuid = this.selectedModule.guid);
    this.changeDetectorRef.markForCheck();
  }

  private populateSheets() {
    this.sheets = this.sheetService.getCurrent();

    this.sheetNames = {};
    this.sheets.forEach(sh => {
      this.sheetNames[sh.id] = sh.name;
    });
  }

  showSheetSelectorPopup(entity: Untold.ClientEntity) {
    this.displaySheetPicker = true;
    this.selectedEntity = entity;
    this.availableSheets = [{
      label: 'No Sheet',
      value: 0
    }];

    this.selectedSheetId = this.selectedEntity.sheetId ? this.selectedEntity.sheetId : 0;

    let definitions = [];

    this.realmDefinitionService.getCurrent().forEach(realmDef => {
      definitions = [...definitions, ...realmDef.definitions];
    });

    const definitionChain = this.definitionEnhancerService.getParentChain(definitions, this.selectedEntity.definitionGuid);

    this.sheets.filter(sh =>  definitionChain.some(chain => chain.definitionGuid === sh.definitionGuid))
      .forEach(sh => {
        this.availableSheets.push({
          label: sh.name,
          value: sh.id
        });
      });

    this.changeDetectorRef.markForCheck();
  }

  saveSheetChange() {
    this.displaySheetPicker = false;
    this.selectedEntity.sheetId = this.selectedSheetId ? this.selectedSheetId : null;
    this.gameWorkflowEntityService.saveEntityName(this.selectedEntity);

    this.changeDetectorRef.markForCheck();
  }

  editName(entity: Untold.ClientEntity) {
    this.editNameEntity = JSON.parse(JSON.stringify(entity));
  }

  closeNameEditor(decision: true) {
    if (decision) {
      this.updateEntityName(this.editNameEntity);
    }

    this.editNameEntity = null;
  }

}
