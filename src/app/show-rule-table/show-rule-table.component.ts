import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy,
         SimpleChanges, OnChanges, ChangeDetectorRef, NgZone } from '@angular/core';

import { SelectItem } from 'primeng/primeng';
import { MenuItem } from 'primeng/primeng';

import { Untold } from '../shared/models/backend-export';
import { TableStorageService } from '../shared/services/table-storage.service';
import { DataTable, AzureTableRow } from '../shared/models/data-table';
import { GenesisDataService } from '../shared/services/rest/genesis-data.service';
import { RealmTableService } from '../store/services/realm-table.service';
import { DataRowStatusConstants } from '../shared/constants/data-row-status-constants';
import { CsvFileService } from '../shared/services/csv-file.service';
import { GameService } from '../store/services/game.service';
import { RealmHubSenderService } from '../shared/services/realm-hub-sender.service';

@Component({
  selector: 'app-show-rule-table',
  templateUrl: './show-rule-table.component.html',
  styleUrls: ['./show-rule-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowRuleTableComponent implements OnInit, OnChanges {
  @Input() table: Untold.ClientRuleTable;
  dataTable: DataTable;
  editColumn: Untold.ClientRuleTableColumn;
  editColumnResponse: Untold.ClientRuleTableColumn;
  nameDraft: string;
  showEditName: boolean;
  selectedRow: AzureTableRow;
  addRowOptions: MenuItem[];

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private tableStorageService: TableStorageService,
              private genesisDataService: GenesisDataService,
              private realmTableService: RealmTableService,
              private csvFileService: CsvFileService,
              private gameService: GameService,
              private realmHubSenderService: RealmHubSenderService,
              private NgZone: NgZone) { }

  ngOnInit() {

    this.addRowOptions = [
      {label: 'Insert Row', icon: 'ui-icon-insert-comment', disabled: true, command: () =>  {
        this.addNewRow(this.selectedRow);
      }},
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editColumn = null;
    this.editColumnResponse = null;

    this.prepareTable();
  }

  prepareTable() {
    this.tableStorageService.getDataTableFromSchema(this.table).subscribe(table => {
      this.dataTable = JSON.parse(JSON.stringify(table));

      this.dataTable.columns = this.dataTable.columns.sort((a, b) => {
          if ( a.order < b.order) {
            return -1;
          } else if (a.order > b.order) {
            return 1;
          }

          return 0;
      });

      this.tableStorageService.populateDataTableFromStorage(this.dataTable)
        .subscribe(dataTable => {
          this.dataTable = dataTable;
          this.changeDetectorRef.markForCheck();
        });
    });
  }

  saveTableSchema() {
    if (this.dataTable) {

      this.table.columns = this.dataTable.columns;
      const module = this.realmTableService.getCurrent().filter(mod => mod.guid === this.table.moduleGuid);

      if (module.length) {
        const moduleId = module[0].id;
        this.genesisDataService.saveRuleTableSchema(moduleId, this.table)
          .subscribe(() => {

            if (module.length) {
              this.realmHubSenderService.reloadRealmTableModules({
                moduleId: moduleId,
                realmId: this.gameService.getCurrent().realm.id
              });
            }
          });
      }
    }
  }

  clickEditColumn(column?: Untold.ClientRuleTableColumn) {
    if (column) {
      this.editColumn = column;
    } else {
      const nextColumnId = this.tableStorageService.getNextColumnId(this.dataTable);
      const nextColumnOrder = this.tableStorageService.getNextColumnOrder(this.dataTable);
      this.editColumn = {
        deleted: false,
        id: nextColumnId,
        name: nextColumnOrder.toString(),
        order: nextColumnOrder,
        rowKey: '',
        type: 'text',
      };
    }
  }

  editColumnUpdated(column: Untold.ClientRuleTableColumn) {
    this.editColumnResponse = column;
  }

  closeEditColumn(decision: boolean) {

    if (decision) {
      this.editColumn.name = this.editColumnResponse.name;

      if (!this.editColumn.rowKey) {
        this.editColumn.name = this.editColumnResponse.name;
        this.editColumn.rowKey = this.editColumn.id.toString();
        this.dataTable.columns = [...this.dataTable.columns, this.editColumn];
      }

      this.saveTableSchema();
    }

    this.editColumn = null;
    this.editColumnResponse = null;
    this.changeDetectorRef.markForCheck();
  }

  deleteColumn() {
    this.editColumn.deleted = true;

    this.saveTableSchema();

    this.editColumn = null;
    this.editColumnResponse = null;
    this.changeDetectorRef.markForCheck();
  }

  editCellComplete(event: any) {
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
    this.saveDataTable();
  }

  checkboxChanged($event, paramRow) {
    const editedRow = this.dataTable.rows.filter(row => {
      return row.RowKey === paramRow.RowKey;
    })[0];

    editedRow.rowStatus = DataRowStatusConstants.Changed;
    this.saveDataTable();
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

    this.saveTableSchema();
  }

  exportCsv() {
    this.csvFileService.saveRuleTable(this.dataTable);
  }

  addNewRow(selectedRow?: AzureTableRow ) {

    const tempRow = {
      PartitionKey: null,
      RowKey: null,
      rowStatus: DataRowStatusConstants.Changed
    };

    if (selectedRow) {
      const pos = this.dataTable.rows.map(row => row.RowKey).indexOf(selectedRow.RowKey);

      this.dataTable.rows = [...this.dataTable.rows.slice(0, pos), tempRow, ...this.dataTable.rows.slice(pos)];
      this.onDrop();
    } else {
      this.dataTable.rows = [... this.dataTable.rows, tempRow];

      this.saveDataTable();
    }

    this.changeDetectorRef.markForCheck();
  }

  deleteRow(cell) {
    const rowToDelete = this.dataTable.rows.filter(row => {
      return row.RowKey === cell.RowKey;
    })[0];

    if (rowToDelete.rowStatus) {
      rowToDelete.rowStatus = DataRowStatusConstants.Deleted;
      this.saveDataTable();
    } else {
      this.dataTable.rows = this.dataTable.rows.filter(row => {
        return row.RowKey !== cell.RowKey;
      });
    }

    this.changeDetectorRef.markForCheck();
  }

  clickEditName() {
    this.nameDraft  = this.table.name;
    this.showEditName = true;
  }

  closeNameEditor(decision: true) {
    if (decision) {
      this.table.name = this.nameDraft;
      this.saveTableSchema();
    }

    this.showEditName = false;
  }

  saveDataTable() {

    this.tableStorageService.saveDataTable(this.dataTable);

    const module = this.realmTableService.getCurrent().filter(mod => mod.guid === this.table.moduleGuid);

    if (module.length) {
      const moduleId = module[0].id;

      this.realmHubSenderService.clearLocalTableCache({
        moduleId: moduleId,
        uniqueTableName: this.table.uniqueTableName,
        realmId: this.gameService.getCurrent().realm.id
      });
    }

    this.changeDetectorRef.markForCheck();
  }

  onDrop() {

  let changed = false;

   do {
     changed = false;
     this.dataTable.rows.forEach((row, index) => {
      if (this.dataTable.rows.length > index + 1) {
        const previous = parseInt(row.RowKey, 10);
        const next = parseInt(this.dataTable.rows[index + 1].RowKey, 10);

        const prevIsNumber = previous.toString() !== 'NaN';
        const nextIsNumber = next.toString() !== 'NaN';

        if ((!prevIsNumber && nextIsNumber) || (prevIsNumber && nextIsNumber && previous > next))  {
          const temp = row.RowKey;
          row.RowKey = this.dataTable.rows[index + 1].RowKey;
          this.dataTable.rows[index + 1].RowKey = temp;

          row.rowStatus = DataRowStatusConstants.Changed;
          this.dataTable.rows[index + 1].rowStatus = DataRowStatusConstants.Changed;
          changed = true;
        }
      }
     });
    } while (changed);

    this.saveDataTable();
  }

  onRowSelect() {
    this.addRowOptions[0].disabled = false;
  }

  onRowUnselect() {
    this.addRowOptions[0].disabled = false;
  }
}
