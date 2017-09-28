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
  @Output() onCompleted = new EventEmitter<boolean>();
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

    if (typeof this.definition.isCollectionChoice === 'undefined') {
      this.definition.isCollectionChoice = true;
    }
    this.optionChoice = this.definition.isCollectionChoice ? 'collection' : 'table';
    this.tables = [{label: 'Select table', value: null}];
    this.columns = [{label: 'Select column', value: null}];

    this.modules = this.realmTableService.getCurrent().map(rd => {
         return {
          label: rd.name,
          value: rd
        };
      });

    this.modules = [{label: 'Select module', value: null}, ...this.modules];

    if (this.definition.isCollectionChoice) {
      this.listItems = this.definition.collectionChoiceList ? this.definition.collectionChoiceList.map(item => {
        return {text: item};
      }) : [];
    } else {
      this.listItems = [];

      const loadedModule = this.modules.filter(mod => mod.value && mod.value.guid === this.definition.choiceModule);

      if (loadedModule.length) {
        this.selectedModule = loadedModule[0].value;
        this.onModuleSelect();

        const loadedTable = this.tables.filter(table => table.value && table.value.tableGuid === this.definition.choiceTable);

        if (loadedTable.length) {
          this.selectedTable = loadedTable[0].value;
          this.onTableSelect();

          const loadedColumn = this.columns.filter(column => column.value === this.definition.choiceColumn);

          if (loadedColumn.length) {
            this.selectedColumn = loadedColumn[0].value;
          }
        }
      }
    }
  }

  onModuleSelect() {
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
  }

  onTableSelect() {
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
  }

  addItemToCollection() {
    this.listItems.push({ text: this.addedItemName});
    this.addedItemName = '';
  }

  moveUp(index: number) {
    const temp = this.listItems[index];
    this.listItems[index] = this.listItems[index - 1];
    this.listItems[index - 1] = temp;
  }

  moveDown(index: number) {
    const temp = this.listItems[index];
    this.listItems[index] = this.listItems[index + 1];
    this.listItems[index + 1] = temp;
  }

  update() {
    if (this.optionChoice === 'table') {
      this.definition.isCollectionChoice = false;
      this.definition.collectionChoiceList = null;
      this.definition.choiceModule = this.selectedModule.guid;
      this.definition.choiceTable = this.selectedTable.tableGuid;
      this.definition.choiceColumn = this.selectedColumn;

    } else {
      this.definition.isCollectionChoice = true;
      this.definition.collectionChoiceList = [];
      this.definition.choiceModule = null;
      this.definition.choiceTable = null;
      this.definition.choiceColumn = null;

      this.listItems.forEach(item => {
        if (item.text && this.definition.collectionChoiceList.indexOf(item.text) === -1) {
          this.definition.collectionChoiceList.push(item.text);
        }
      });
    }

    this.onCompleted.emit(true);
  }

  cancel() {
    this.onCompleted.emit(false);
  }

}
