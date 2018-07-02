import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, max, first } from 'rxjs/operators';


import { AzureTableRow, DataTable } from '../models/data-table';
import { DataRowStatusConstants } from '../constants/data-row-status-constants';
import { Untold } from '../../shared/models/backend-export';
import { StorageDataService } from './rest/storage-data.service';

@Injectable()
export class TableStorageService {

  constructor(private storageDataService: StorageDataService) {

  }

  getDataTableFromSchema(clientTable: Untold.ClientRuleTable): Observable<DataTable> {
    const dataTable: DataTable = {
      columns: [],
      rows: [],
      readAccessSignature: clientTable.readAccessSignature,
      editorAccessSignature: clientTable.editorAccessSignature,
      oldName: clientTable.name,
      name: clientTable.name,
      uniqueName: clientTable.uniqueTableName,
      oldColumns: []
    };

    return this.storageDataService.readColumns(dataTable.uniqueName, dataTable.readAccessSignature)
      .pipe(map(res => {
        const columns: any = JSON.parse(res);

        if (columns) {
          dataTable.columns = columns.value.map(col => {
            return {
              deleted: col['deleted'],
              id: parseInt(col['id'], 10),
              name: col['name'],
              order: parseInt(col['order'], 10),
              rowKey: col['RowKey'],
              type: col['type']
            };
          });
        }

        return dataTable;
      }));
  }

  populateDataTableFromStorage(dataTable: DataTable): Observable<DataTable> {
    const updatedTable = JSON.parse(JSON.stringify(dataTable));

    return this.storageDataService.readRows(dataTable.uniqueName, dataTable.readAccessSignature)
      .pipe(map(res => {
        const entities = JSON.parse(res);
        this.populateDataTable(updatedTable, entities.value);

        return updatedTable;
      }));
  }

  saveDataTable(dataTable: DataTable) {
    const schemaUpdateRequired = dataTable.name !== dataTable.oldName ||
      JSON.stringify(dataTable.oldColumns) !== JSON.stringify(dataTable.columns);

    const rowsToUpdate = dataTable.rows.filter(row => {
      return row.rowStatus === DataRowStatusConstants.Changed;
    });

    const rowsToDelete = dataTable.rows.filter(row => {
      return row.rowStatus === DataRowStatusConstants.Deleted;
    });

    if (rowsToUpdate.length) {
      this.insertUpdateRows(dataTable, rowsToUpdate);
    }

    if (rowsToDelete.length) {
      this.deleterows(dataTable, rowsToDelete);
    }
  }

  getNextColumnId(dataTable: DataTable): number {
    let maxNumber: number;

    if (dataTable.columns.length) {
      from(dataTable.columns)
        .pipe(map(col => col.id),
          max(),
          first())
        .forEach(maxVal => {
          maxNumber = maxVal;
        });
    }

    return maxNumber ? maxNumber + 1 : 1;
  }

  getNextColumnOrder(dataTable: DataTable): number {
    let maxNumber: number;

    if (dataTable.columns.length) {
      from(dataTable.columns)
        .pipe(map(col => col.order),
          max(),
          first())
        .forEach(maxVal => {
          maxNumber = maxVal;
        });
    }

    return maxNumber ? maxNumber + 1 : 1;
  }

  padNumber(position: number): string {
    const posToString = position.toString();
    const paddedPos = '000000' + posToString;
    return paddedPos.substring(posToString.length);
  }

  private populateDataTable(dataTable: DataTable, data: Array<any>) {
    dataTable.rows = [];

    data.forEach(row => {
      const addRow: AzureTableRow = {
        PartitionKey: row['PartitionKey'],
        RowKey: row['RowKey'],
        rowStatus: DataRowStatusConstants.Exist
      };

      dataTable.columns.forEach(column => {
        const id = 'c' + column.id;
        addRow[id] = row[id];
      });

      dataTable.rows.push(addRow);
    });
  }

  private insertUpdateRows(dataTable: DataTable, rows: Array<AzureTableRow>) {
    const url = '' + dataTable.uniqueName + dataTable.editorAccessSignature;

    rows.forEach(row => {
      row.rowStatus = DataRowStatusConstants.Saving;

      const data = this.rowToTableEntity(row, dataTable, this.getNextRowKey(dataTable));
      this.storageDataService.insertOrUpdate(data, dataTable.uniqueName, dataTable.editorAccessSignature)
        .subscribe(() => {
          if (row.rowStatus === DataRowStatusConstants.Saving) {
            row.rowStatus = DataRowStatusConstants.Exist;
          }

          console.log('Save succeded');
        }, () => {
          console.log('Error');
        });
    });
  }

  private deleterows(dataTable: DataTable, rows: Array<AzureTableRow>) {
    const url = '' + dataTable.uniqueName + dataTable.editorAccessSignature;

    rows.forEach(row => {
      if (row.PartitionKey && row.RowKey) {
        const data = this.rowToTableEntity(row, dataTable, row.RowKey);
        this.storageDataService.delete(data, dataTable.uniqueName, dataTable.editorAccessSignature).subscribe(() => {
        });
      }

      dataTable.rows = dataTable.rows.filter(innerRow => innerRow !== row);
    });
  }

  private rowToTableEntity(row: AzureTableRow, dataTable: DataTable, rowKey: string) {
    if (!row.PartitionKey) {
      row.PartitionKey = 'row';
    }

    if (!row.RowKey) {
      row.RowKey = rowKey;
    }

    const data = JSON.parse(JSON.stringify(row));
    delete data.rowStatus;
    delete data._$visited;

    return data;
  }

  public getNextRowKey(dataTable: DataTable): string {
    let maxNumber: number;
    from(dataTable.rows)
      .pipe(map(row => {
        if (parseInt(row.RowKey, 10).toString() === 'NaN') {
          return 0;
        } else {
          return parseInt(row.RowKey, 10);
        }
      }),
        max(),
        first())
      .forEach(maxVal => {
        maxNumber = maxVal;
      });

    const nextRowKey = maxNumber ? maxNumber + 1 : 1;

    return this.padNumber(nextRowKey);
  }
}
