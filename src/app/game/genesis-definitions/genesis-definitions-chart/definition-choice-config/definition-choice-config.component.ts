import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {RadioButtonModule} from 'primeng/primeng';

import { SelectItem } from 'primeng/primeng';

import { Untold } from '../../../../shared/models/backend-export';
import { ExpressionTableCacheService } from '../../../../shared/services/expressions/expression-table-cache.service';
import { RealmTableService } from '../../../../store/services/realm-table.service';

@Component({
  selector: 'app-definition-choice-config',
  templateUrl: './definition-choice-config.component.html',
  styleUrls: ['./definition-choice-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefinitionChoiceConfigComponent implements OnInit {
  @Input() definition: Untold.ClientInnerDefinition;
  @Output() onUpdated = new EventEmitter<Untold.ClientInnerDefinition>();
  draftDefinition: Untold.ClientInnerDefinition;
  optionChoice: string = 'table';
  listItems: Array<any>;
  addedItemName: string;
  modules: Array<SelectItem>;
  selectedModule: Untold.ClientModuleTables;
  tables: Array<SelectItem>;
  selectedTable: Untold.ClientRuleTable;
  columns: Array<SelectItem>;
  selectedColumn: string;

  constructor(private expressionTableCacheService: ExpressionTableCacheService,
              private changeDetectorRef: ChangeDetectorRef,
              private realmTableService: RealmTableService) { }

  ngOnInit() {
    this.draftDefinition = JSON.parse(JSON.stringify(this.definition));

    if (typeof this.draftDefinition.isCollectionChoice === 'undefined') {
      this.draftDefinition.isCollectionChoice = true;
    }
    this.optionChoice = this.draftDefinition.isCollectionChoice ? 'collection' : 'table';
    this.tables = [{label: 'Select table', value: null}];
    this.columns = [{label: 'Select column', value: null}];

    this.modules = this.realmTableService.getCurrent().map(rd => {
         return {
          label: rd.name,
          value: rd
        };
      });

    this.modules = [{label: 'Select module', value: null}, ...this.modules];

    if (this.draftDefinition.isCollectionChoice) {
      this.listItems = this.draftDefinition.collectionChoiceList ? this.draftDefinition.collectionChoiceList.map(item => {
        return {text: item};
      }) : [];
    } else {
      this.listItems = [];

      const loadedModule = this.modules.filter(mod => mod.value && mod.value.guid === this.draftDefinition.choiceModule);

      if (loadedModule.length) {
        this.selectedModule = loadedModule[0].value;
        this.onModuleSelect(false);

        const loadedTable = this.tables.filter(table => table.value && table.value.tableGuid === this.draftDefinition.choiceTable);

        if (loadedTable.length) {
          this.selectedTable = loadedTable[0].value;
          this.onTableSelect(false);

          const loadedColumn = this.columns.filter(column => column.value === this.draftDefinition.choiceColumn);

          if (loadedColumn.length) {
            this.selectedColumn = loadedColumn[0].value;
          }
        }
      }
    }
  }

  onModuleSelect(update: boolean) {
    if (this.selectedModule) {
      const parsedModule = <Untold.ClientModuleTables> (<any> this.selectedModule);
      const moduleTables = parsedModule.tables.map(mt => {
        return {
          label: mt.name,
          value: mt
        };
      });

      this.tables = [this.tables[0], ...moduleTables];

    } else {
      this.selectedTable = null;
      this.tables = [this.tables[0]];
    }

    if (update) {
      this.update();
    }
  }

  onTableSelect(update: boolean) {
    if (this.selectedTable) {
      const parsedTable = <Untold.ClientRuleTable> (<any> this.selectedTable);

      this.expressionTableCacheService.getCachedTable(parsedTable.name, this.selectedModule.name).subscribe(res => {
        const columns = res.columns.map(col => {
          return {
            label: col.name,
            value: col.name
          };
        });

        this.columns = [this.columns[0], ...columns];
        this.changeDetectorRef.markForCheck();
      }, err => {
        this.selectedColumn = null;
        this.columns = [this.columns[0]];
        this.changeDetectorRef.markForCheck();
      });
    } else {
      this.selectedColumn = null;
    }

    if (update) {
      this.update();
    }
  }

  onColumnSelect() {
    this.update();
  }

  addItemToCollection() {
    this.listItems = [...this.listItems, { text: this.addedItemName}];
    this.addedItemName = '';
    this.update();
  }

  changeOption(value: string) {
    this.optionChoice = value;
    this.update();
  }

  update() {
    if (this.optionChoice === 'table') {
      this.draftDefinition.isCollectionChoice = false;
      this.draftDefinition.collectionChoiceList = null;
      this.draftDefinition.choiceModule = this.selectedModule ? this.selectedModule.guid : null;
      this.draftDefinition.choiceTable = this.selectedTable ? this.selectedTable.tableGuid : null;
      this.draftDefinition.choiceColumn = this.selectedColumn;

    } else {
      this.draftDefinition.isCollectionChoice = true;
      this.draftDefinition.collectionChoiceList = [];
      this.draftDefinition.choiceModule = null;
      this.draftDefinition.choiceTable = null;
      this.draftDefinition.choiceColumn = null;

      this.listItems.forEach(item => {
        if (item.text && this.draftDefinition.collectionChoiceList.indexOf(item.text) === -1) {
          this.draftDefinition.collectionChoiceList.push(item.text);
        }
      });
    }

    this.onUpdated.emit(this.draftDefinition);
  }
}
