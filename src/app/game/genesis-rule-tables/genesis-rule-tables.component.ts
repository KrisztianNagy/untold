import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import 'rxjs/add/operator/max';
import 'rxjs/add/operator/map';

import { SelectItem } from 'primeng/primeng';

import { GenesisDataService } from '../../shared/services/rest/genesis-data.service';
import { GameService } from '../../store/services/game.service';
import { Untold } from '../../shared/models/backend-export';
import { TableStorageService } from '../../shared/services/table-storage.service';
import { CsvFileService } from '../../shared/services/csv-file.service';
import { AzureTableRow, DataTable } from '../../shared/models/data-table';
import { DataRowStatusConstants } from '../../shared/constants/data-row-status-constants';
import { RealmTableService } from '../../store/services/realm-table.service';
import { RealmHubSenderService } from '../../shared/services/realm-hub-sender.service';

@Component({
  selector: 'app-genesis-rule-tables',
  templateUrl: './genesis-rule-tables.component.html',
  styleUrls: ['./genesis-rule-tables.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenesisRuleTablesComponent implements OnInit, OnDestroy {
  modules: Array<SelectItem>;
  selectedModule: Untold.ClientModuleTables;
  ruleTables: Array<Untold.ClientRuleTable>;
  selectedTable: Untold.ClientRuleTable;
  selectedTableData: Array<any>;
  addColumnName: string;
  renameColumnName: string;
  dataTable: DataTable;
  columnTypes: Array<SelectItem>;
  selectedColumnType: string;
  selectedColumn: string;
  columns: Array<SelectItem>;
  isDeleteVisible: boolean;
  importMode: boolean;
  private tableSubscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private genesisDataService: GenesisDataService,
              private gameService: GameService,
              private tableStorageService: TableStorageService,
              private csvFileService: CsvFileService,
              private realmTableService: RealmTableService,
              private realmHubSenderService: RealmHubSenderService) {

    this.columnTypes = [];
    this.columnTypes.push({label: 'Text', value: 'text'});
    this.columnTypes.push({label: 'Number', value: 'number'});
    this.columnTypes.push({label: 'Yes/No', value: 'bool'});
    this.selectedColumnType = 'text';

    this.columns = [];
  }

  ngOnInit() {
    this.tableSubscription = this.realmTableService.realmTables.subscribe(realmTables => {
      this.modules = realmTables.map(rt => {
         return {
          label: rt.name,
          value: rt
        };
      });

      if (this.selectedModule) {
        const matching = realmTables.filter(rt => rt.id === this.selectedModule.id);
        this.selectedModule = matching.length ? matching[0] : null;
      }

      if (!this.selectedModule && this.modules.length ) {
        this.selectedModule = this.modules[0].value;
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.tableSubscription.unsubscribe();
  }

  showImport() {
    this.importMode = true;
  }

  showEdit(ruleTable: Untold.ClientRuleTable) {
    this.selectedTable = ruleTable ?
      JSON.parse(JSON.stringify(ruleTable)) : {
      columns: '',
      readAccessSignature: '',
      editorAccessSignature: '',
      moduleGuid: this.selectedModule.guid,
      name: '',
      tableGuid: ''
    };

    if (this.selectedTable.editorAccessSignature) {
      this.tableStorageService.getDataTableFromSchema(this.selectedTable).subscribe(table => {
        this.dataTable = table;

        this.dataTable.columns = this.dataTable.columns.sort((a, b) => {
            if ( a.order < b.order) {
              return -1;
            } else if (a.order > b.order) {
              return 1;
            }

            return 0;
        });

        this.columns = this.dataTable.columns
          .filter(col => !col.deleted)
          .map(col => {
            return {
              label: col.name,
              value: 'c' + col.id
            };
          });

      this.tableStorageService.populateDataTableFromStorage(this.dataTable)
        .subscribe(dataTable => {
          this.dataTable = dataTable;
          this.changeDetectorRef.markForCheck();
        });
      });
    }

    this.changeDetectorRef.markForCheck();
  }

  hideEdit() {
    this.selectedTable = null;
    this.dataTable = null;
    this.renameColumnName = '';
    this.addColumnName = '';
    this.selectedColumn = null;
  }

  saveTable() {
    if (this.dataTable) {

      this.selectedTable.columns = this.dataTable.columns;

      this.genesisDataService.saveRuleTableSchema(this.selectedModule.id, this.selectedTable)
        .subscribe(ruleTable => {
      });
    } else {
      this.genesisDataService.createRuletableSchema(this.selectedModule.id, this.selectedTable)
        .subscribe(() => {
          this.hideEdit();
          this.genesisDataService.getRuleTablesByRealm(this.gameService.getCurrent().realm.id).subscribe(rt => {
            this.realmTableService.updateRealmTables(rt.moduleTables);
            this.realmHubSenderService.reloadRealmTableModules({
              moduleId: this.selectedModule.id,
              realmId: this.gameService.getCurrent().realm.id
            });
          });
      });
    }
  }

  editComplete(event: any) {
    const editedRow = this.dataTable.rows.filter(row => {
      return row.RowKey === event.data.RowKey;
    })[0];

    const fieldName = event.column.field;
    const field = this.dataTable.columns.filter(col => {
      return fieldName === 'c' + col.id;
    })[0];

    if (field.type === 'number') {
      if (parseInt(editedRow[fieldName], 10).toString() !== 'NaN') {
        editedRow[fieldName] = parseInt(editedRow[fieldName], 10);
      } else {
        editedRow[fieldName] = null;
      }
    }

    editedRow.rowStatus = DataRowStatusConstants.Changed;
    this.tableStorageService.saveDataTable(this.dataTable);
  }

  colReorder(event: any) {
    const column1 = this.dataTable.columns.filter(col => {
      return 'c' + col.id === event.columns[0].field;
    })[0];

    const column2 = this.dataTable.columns.filter(col => {
      return 'c' + col.id === event.columns[1].field;
    })[0];

    const temp = column1.order;
    column1.order = column2.order;
    column2.order = temp;

    this.saveTable();
  }

  removeColumn() {
    this.dataTable.columns.filter(col => {
      return 'c' + col.id !== this.selectedColumn;
    })[0].deleted = true;

    this.columns = this.dataTable.columns
      .filter(col => !col.deleted)
      .map(col => {
        return {
          label: col.name,
          value: 'c' + col.id
        };
      });

    this.saveTable();
  }

  saveColumnName() {
    const column = this.dataTable.columns.filter(col => {
      return 'c' + col.id === this.selectedColumn;
    })[0];

    this.columns.filter(col => {
      return col.value === this.selectedColumn;
    })[0].label = this.renameColumnName;

    column.name = this.renameColumnName;
    this.saveTable();
    this.changeDetectorRef.markForCheck();
  }

  selectColumn(event) {
    this.renameColumnName = this.columns.filter(col => {
      return col.value === event.value;
    })[0].label;
  }

  addColumn() {
    const nextColumnId = this.tableStorageService.getNextColumnId(this.dataTable);
    const nextColumnOrder = this.tableStorageService.getNextColumnOrder(this.dataTable);

    this.dataTable.columns = [...this.dataTable.columns, {
      id: nextColumnId,
      name: this.addColumnName,
      type: this.selectedColumnType,
      deleted: false,
      order: nextColumnOrder,
      rowKey: nextColumnId.toString()
    }];

    this.columns = [...this.columns, {
      label: this.addColumnName,
      value: 'c' + nextColumnId
    }];

    this.addColumnName = '';
    this.saveTable();
    this.changeDetectorRef.markForCheck();
  }

  addRow() {
    this.dataTable.rows.push({
      PartitionKey: null,
      RowKey: null,
      rowStatus: DataRowStatusConstants.Draft
    });

    this.changeDetectorRef.markForCheck();
  }

  checkboxChanged($event, paramRow) {
    const editedRow = this.dataTable.rows.filter(row => {
      return row.RowKey === paramRow.RowKey;
    })[0];

    editedRow.rowStatus = DataRowStatusConstants.Changed;
    this.tableStorageService.saveDataTable(this.dataTable);
  }

  deleteVisibleChanged(event) {

  }

  deleteRow(cell) {
    const rowToDelete = this.dataTable.rows.filter(row => {
      return row.RowKey === cell.RowKey;
    })[0];

    if (rowToDelete.rowStatus) {
      rowToDelete.rowStatus = DataRowStatusConstants.Deleted;
      this.tableStorageService.saveDataTable(this.dataTable);
    } else {
      this.dataTable.rows = this.dataTable.rows.filter(row => {
        return row.RowKey !== cell.RowKey;
      });
    }

    this.changeDetectorRef.markForCheck();
  }

  deleteTable(ruleTable: Untold.ClientRuleTable) {
    const modId = this.selectedModule.id;
    const tableReference: Untold.ClientRuleTableReference = {
      realmId: this.gameService.getCurrent().realm.id,
      uniqueTableName: ruleTable.uniqueTableName,
      'moduleId': modId
    };

    tableReference.moduleId = modId;
    this.genesisDataService.deleteRuleTable(modId, ruleTable)
      .subscribe(() => {
        this.realmTableService.deleteRealmTable(tableReference);
        this.realmHubSenderService.realmTableDeleted(tableReference);
      });
  }

  exportCsv() {
    this.csvFileService.saveRuleTable(this.dataTable);
  }

}
