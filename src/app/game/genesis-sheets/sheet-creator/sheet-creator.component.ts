import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SelectItem } from 'primeng/primeng';

import { Untold } from '../../../shared/models/backend-export';
import { Sheet, SheetScript, SheetTab } from '../../../store/models/sheet';
import { SheetEntityService } from '../../../shared/services/expressions/sheet-entity.service';
import { SheetService } from '../../../store/services/sheet.service';
import { EntityService } from '../../../store/services/entity.service';
import { EntityEnhancerService } from '../../../shared/services/expressions/entity-enhancer.service';
import { DefinitionEnhancerService } from '../../../shared/services/expressions/definition-enhancer.service';
import { GameWorkflowSheetService } from '../../../shared/services/game-flow/game-workflow-sheet.service';
import { RealmDefinitionService } from '../../../store/services/realm-definition.service';
import { SheetElement } from '../../../shared/models/sheet-element';

@Component({
  selector: 'app-sheet-creator',
  templateUrl: './sheet-creator.component.html',
  styleUrls: ['./sheet-creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SheetCreatorComponent implements OnInit, OnDestroy {
  private previewVisible: boolean;
  private sheet: Sheet;
  private model: any;
  private buildResultIcon: string;
  private id: number;
  private routeSub: any;
  private sheetSub: any;
  private entities: Array<SelectItem>;
  private commands: Array<SelectItem>;
  private tabList: Array<SelectItem>;
  private selectedEntity: Untold.ClientEntity;
  private sheetVisible: boolean;
  private modelMappings: Array<SelectItem>;
  private selectedMapping: string;
  private snippet: any;
  private displayDefinitionsChart: boolean;
  private definition: Untold.ClientDefinition;
  private snippetDefinition: Untold.ClientInnerDefinition;
  private options: object;
  private selectedCommand: SheetScript
  private selectedScript: string;
  private selectedTab: SheetTab;
  private commandResult: any;
  private snippetCollapsed = true;
  private commandTestFormat: string;
  private commandTestInput: string;
  private tabIndex = 0;
  private sheetTabVisible = false;
  private definitionPickerVisible: boolean;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private sheetEntityService: SheetEntityService,
              private sheetService: SheetService,
              private entityService: EntityService,
              private entityEnhancerService: EntityEnhancerService,
              private definitionEnhancerService: DefinitionEnhancerService,
              private changeDetectorRef: ChangeDetectorRef,
              private gameWorkflowSheetService: GameWorkflowSheetService,
              private realmDefinitionService: RealmDefinitionService) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      if (params['id']) {
          this.id = parseInt(params['id'], 10);
          console.log(this.id);
          this.sheetSub = this.sheetService.sheets
          .subscribe(sheets =>
              sheets.filter(sh => sh.id === this.id)
              .forEach(sh => {
                  this.sheet = sh;

                  if (this.sheetSub) {
                      this.sheetSub.unsubscribe();
                  }

                  this.entities = this.entityService.getCurrent().map(ent => {
                      return {
                          label: ent.name,
                          value: ent
                      };
                  });

                  if (this.entities.length) {
                      this.selectedEntity = this.entities[0].value;
                  }

                  this.populateTabList();
                  this.setModel();
                  this.populateDefinitionMapping();

                  this.definitionEnhancerService.getAllChoiceOptions(<Untold.ClientInnerDefinition> this.definition)
                  .subscribe(choiceOptions => {
                      this.options = choiceOptions;
                      this.changeDetectorRef.markForCheck();
                  });
              }));
          }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
        this.routeSub.unsubscribe();
    }

    if (this.sheetSub) {
        this.sheetSub.unsubscribe();
    }
  }

  private populateDefinitionMapping() {
    const modules = this.realmDefinitionService.getCurrent();

    modules.forEach(mod => {
        mod.definitions.forEach(def => {
            if (def.definitionGuid === this.sheet.definitionGuid) {
                this.definition = def;
            }
        });
    });
}

  private onModelUpdated() {
    this.setModel();
  }

  entityChanged() {
      this.setModel();
  }

  populateTabList() {
    this.tabList = this.sheet.json.map(tab => {
      return {
        label: tab.name,
        value: tab
      };
    });

    if (this.tabList.length) {
      this.selectedTab = this.tabList[0].value;
    }
  }

  tabListUpdated(event) {
    this.sheet.json = event;
    this.populateTabList();
    this.changeDetectorRef.markForCheck();
  }

  private setModel() {
    if (this.selectedEntity) {
      this.entityEnhancerService.getGenesisEntity(this.selectedEntity).subscribe(gen => {
        const simple = this.sheetEntityService.getSimpleEntityFromGenesisEntity(gen);
        this.model = simple;

        this.changeDetectorRef.markForCheck();
      });
    } else {
      this.model = {};
    }
  }

  private saveSheet() {
    this.sheet.json = this.tabList.map(tab => tab.value);
    this.gameWorkflowSheetService.saveSheetContent(this.sheet);
  }

  sheetElementUpdated(sheetElement: SheetElement) {
    this.selectedTab.sheet = sheetElement;
    this.changeDetectorRef.markForCheck();
  }

  showSheetTab() {
    this.sheetTabVisible = true;
  }
}
