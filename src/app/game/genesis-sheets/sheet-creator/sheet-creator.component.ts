import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SelectItem } from 'primeng/primeng';

import { Untold } from '../../../shared/models/backend-export';
import { Sheet, SheetScript, SheetTab } from '../../../store/models/sheet';
import { SheetEntityService } from '../../../shared/services/expressions/sheet-entity.service';
import { SheetService } from '../../../store/services/sheet.service';
import { EntityService } from '../../../store/services/entity.service';
import { EntityEnhancerService } from '../../../shared/services/expressions/entity-enhancer.service';
import { SheetEnhancerService } from '../../../shared/services/expressions/sheet-enhancer.service';
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
  previewVisible: boolean;
  sheet: Sheet;
  model: any;
  buildResultIcon: string;
  id: number;
  routeSub: any;
  sheetSub: any;
  entities: Array<SelectItem>;
  commands: Array<SelectItem>;
  tabList: Array<SelectItem>;
  selectedEntity: Untold.ClientEntity;
  sheetVisible: boolean;
  modelMappings: Array<SelectItem>;
  selectedMapping: string;
  snippet: any;
  displayDefinitionsChart: boolean;
  definition: Untold.ClientDefinition;
  snippetDefinition: Untold.ClientInnerDefinition;
  options: object;
  selectedCommand: SheetScript;
  selectedScript: string;
  selectedTab: SheetTab;
  commandResult: any;
  snippetCollapsed = true;
  commandTestFormat: string;
  commandTestInput: string;
  tabIndex = 0;
  sheetTabVisible = false;
  definitionPickerVisible: boolean;
  visiblePreview: boolean;
  sheetHtml: string;
  sheetCss: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private sheetEntityService: SheetEntityService,
              private sheetService: SheetService,
              private entityService: EntityService,
              private entityEnhancerService: EntityEnhancerService,
              private definitionEnhancerService: DefinitionEnhancerService,
              private changeDetectorRef: ChangeDetectorRef,
              private gameWorkflowSheetService: GameWorkflowSheetService,
              private realmDefinitionService: RealmDefinitionService,
              private sheetEnhancerService: SheetEnhancerService) { }

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

  saveSheet() {
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

  onTabChange(event) {
    this.visiblePreview = event.index === 1;

    if (this.visiblePreview) {
      this.sheetCss = this.sheetEnhancerService.getSheetCss(this.sheet);
      this.sheetHtml = this.sheetEnhancerService.getSheetHtml(this.sheet, this.definition);
    }
  }

  onBuildCompleted(event: boolean) {
    console.log('sheet completed');
    this.changeDetectorRef.markForCheck();
  }

  onCommandExecuted(commandName: string) {
    
  }
}
