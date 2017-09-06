import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { SelectItem } from 'primeng/primeng';

import { Untold } from '../../../../../../shared/models/backend-export';
import { GenesisEntity } from '../../../../../../shared/models/genesis-entity';
import { RealmTableService } from '../../../../../../store/services/realm-table.service';
import { ExpressionTableCacheService } from '../../../../../../shared/services/expressions/expression-table-cache.service';
@Component({
  selector: 'app-expression-builder',
  templateUrl: './expression-builder.component.html',
  styleUrls: ['./expression-builder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpressionBuilderComponent implements OnInit {
  @Input() editedDefinition: Untold.ClientInnerDefinition;
  @Output() onInsert = new EventEmitter<string>();

  simpleDefinitions: Array<SelectItem>;
  listDefinitions: Array<SelectItem>;
  selectedSimpleDefinition: string;
  selectedListDefinition: string;
  functions: Array<SelectItem>;
  selectedFunction: any;
  modules: Array<SelectItem>;
  selectedModule: Untold.ClientModuleTables;
  tables: Array<SelectItem>;
  selectedTable: Untold.ClientRuleTable;
  matchColumns: Array<SelectItem>;
  selectedMatchColumn: string;
  targetColumns: Array<SelectItem>;
  selectedTargetColumn: string;


  constructor(private changeDetectorRef: ChangeDetectorRef,
              private realmTableService: RealmTableService,
              private expressionTableCacheService: ExpressionTableCacheService) { }

  ngOnInit() {
    this.simpleDefinitions = [{label: 'Select definition', value: null}];
    this.listDefinitions = [{label: 'Select list definition', value: null}];
    this.functions = [{label: 'Select function', value: null}];
    this.modules = [{label: 'Select module', value: null}];
    this.tables = [{label: 'Select table', value: null}];
    this.matchColumns = [{label: 'Select match column', value: null}];
    this.targetColumns = [{label: 'Select target column', value: null}];

    this.processDefinition(this.editedDefinition, '', false, true);
    this.populateFunctions();
    this.populateModules();

    this.changeDetectorRef.markForCheck();
  }

  insertMember() {
    this.onInsert.emit(this.selectedSimpleDefinition);
  }

  insertList() {
    this.onInsert.emit(this.selectedListDefinition);
  }

  insertFunction() {
    this.onInsert.emit((<any>this.selectedFunction).expression);
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

        this.matchColumns = [this.matchColumns[0], ...columns];
        this.targetColumns = [this.targetColumns[0], ...columns];
        this.changeDetectorRef.markForCheck();
      }, err => {
        this.selectedMatchColumn = null;
        this.selectedTargetColumn = null;
        this.matchColumns = [this.matchColumns[0]];
        this.targetColumns = [this.targetColumns[0]];
        this.changeDetectorRef.markForCheck();
      });
    } else {
      this.selectedMatchColumn = null;
      this.selectedTargetColumn = null;
      this.matchColumns = [this.matchColumns[0]];
      this.targetColumns = [this.targetColumns[0]];
    }
  }

  insertTable() {
    const matchValue = this.selectedSimpleDefinition ? this.selectedSimpleDefinition : 1;

    // tslint:disable-next-line:max-line-length
    const expr = `table('${this.selectedTable.name}', '${this.selectedMatchColumn}', ${matchValue}, '${this.selectedTargetColumn}', '${this.selectedModule.name}') `;

    this.onInsert.emit(expr);
  }

  private processDefinition(definition: Untold.ClientInnerDefinition,
                            displayName: string, inList: boolean, root: boolean) {
    if (definition) {
      if (!root) {
        if (displayName) {
          displayName += '.';
        }
        displayName += definition.name;

        if (!definition.isList && !inList) {
          this.simpleDefinitions.push({label: displayName, value: displayName});
        } else {
          this.listDefinitions.push({label: displayName, value: displayName});
        }
      }

      if (definition.definitions) {
        definition.definitions
          .forEach(def => this.processDefinition(def, displayName, definition.isList || inList, false));
      }
    }
  }

  private populateFunctions() {
    this.functions.push({
      label: 'ceil()',
      value: {
        expression: 'ceil()',
        description: 'Rounds up the number to the closest integer'}
      });

    this.functions.push({
      label: 'float()',
      value: {
        expression: 'float()',
        description: 'Rounds down the number to the closest integer'}
      });

    this.functions.push({
      label: 'min()',
      value: {
        expression: 'min()',
        description: 'Gets the smallest number from an array or a list definition'}
      });

      this.functions.push({
        label: 'max()',
        value: {
          expression: 'max()',
          description: 'Gets the largest number from an array or a list definition'}
        });

      this.functions.push({
        label: 'sum()',
        value: {
          expression: 'sum()',
          description: 'Sums all numbers in an array or a list definition'}
        });
  }

  private populateModules(){
    const realmModules = this.realmTableService.getCurrent().map(rt => {
      return {
        label: rt.name,
        value: rt
      };
    });

    this.modules = [...this.modules, ...realmModules];
  }

  private populateTablesByModules() {

  }

  private populateFieldsByTable() {

  }

  private getSelectItemFromDefinition(definition: Untold.ClientInnerDefinition, displayName: string): SelectItem {
    return {
      label: displayName,
      value: definition,
    }
  }

}
