import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs';

import { Untold } from '../../models/backend-export';
import { RealmTableService } from '../../../store/services/realm-table.service';
import { StorageDataService } from '../rest/storage-data.service';

@Injectable()
export class ExpressionTableCacheService {
    private cachedTables: Untold.ClientRuleTableBulkInsert[];

    constructor(private realmTableService: RealmTableService,
                private storageDataService: StorageDataService) {
        this.cachedTables = [];
    }

    getCachedTable(tableName: string, moduleName: string): AsyncSubject<Untold.ClientRuleTableBulkInsert> {
        const subject = new AsyncSubject<Untold.ClientRuleTableBulkInsert>();

        const table = this.getRuleTableFromStore(tableName, moduleName);

        if (!table) {
            subject.error('Table ' + tableName + ' does not exist.');
        } else {
            const cached = this.cachedTables.filter(ct => ct.tableGuid === table.tableGuid);

            if (cached.length === 0) {
                this.storageDataService.readColumns(table.uniqueTableName, table.readAccessSignature)
                .subscribe(res => {
                    const columns: any = JSON.parse(res);
                    const nextCached = {
                        tableGuid: table.tableGuid,
                        tableUniqueName: table.uniqueTableName,
                        entities: [],
                        columns: []
                    };

                    if (columns) {
                        nextCached.columns = columns.value.map(col => {
                            return {
                                deleted: col['deleted'],
                                id: parseInt(col['id'], 10),
                                name: col['name'],
                                order: parseInt(col['order'], 10),
                                rowKey: col['RowKey'],
                                type: col['type']
                            };
                        })
                        .sort((a, b) => {
                            if ( a.order < b.order) {
                            return -1;
                            } else if (a.order > b.order) {
                            return 1;
                            }

                            return 0;
                        });
                    }

                    this.cachedTables = [...this.cachedTables, nextCached];
                    subject.next(nextCached);
                    subject.complete();
                }, err => {
                    subject.error(err);
                });
            } else {
                subject.next(cached[0]);
                subject.complete();
            }
        }

        return subject;
    }

    getTableValue (tableName: string, matchField: string, matchValue: string | number, readField: string, moduleName: string):
        AsyncSubject<any> {
        const subject = new AsyncSubject<any>();

        this.getCachedTable(tableName, moduleName).subscribe(table => {
            const matchColumn = table.columns.filter(col => col.name.toLowerCase().trim() === matchField.toLowerCase().trim());
            const readColumn = table.columns.filter(col => col.name.toLowerCase().trim() === readField.toLowerCase().trim());

            if (matchColumn.length === 0) {
                subject.error('Match column ' + matchField + ' does not exist');
            } else if (readColumn.length === 0) {
                subject.error('Read column ' + readField + ' does not exist');
            } else {

                // tslint:disable-next-line:triple-equals
                const entity = table.entities.filter(ent => ent.properties['c' + matchColumn[0].id] == matchValue);

                if (entity.length === 0) {
                    const filter = this.getFilter(matchColumn[0], matchValue);

                    if (!filter) {
                        subject.error('Could not match ' + matchColumn[0] + ' (' + matchColumn[0].type + ' ) to ' +
                                     typeof(matchValue) === 'string' ? '"' + matchValue + '"' : matchValue.toString());
                    }

                    const access = this.getRuleTableFromStore(tableName, moduleName).readAccessSignature;

                    this.storageDataService.readFilteredRows(table.tableUniqueName, access, filter)
                        .subscribe(res => {
                            const rows: any = JSON.parse(res);

                            if (rows) {
                                const row = rows.value[0];

                                const addEntity: Untold.ClientRuleTableBulkInsertEntity = {
                                    partitionKey: row['PartitionKey'],
                                    rowKey: row['RowKey'],
                                    properties: []
                                };

                                table.columns.forEach(column => {
                                    const id = 'c' + column.id;
                                    addEntity.properties[id] = row[id];
                                });

                                table.entities = [...table.entities, addEntity];
                                subject.next(addEntity.properties['c' + readColumn[0].id]);
                                subject.complete();
                            } else {
                                subject.next(null);
                                subject.complete();
                            }
                        });
                } else {
                    subject.next(entity[0].properties['c' + readColumn[0].id]);
                    subject.complete();
                }
            }
        }, err => {
            subject.error(err);
        });

        return subject;
    }

    getTableColumnValues (tableName: string, fieldName: string, moduleName: string): AsyncSubject<any> {
        const subject = new AsyncSubject<any>();

        this.getCachedTable(tableName, moduleName).subscribe(table => {
            const column = table.columns.filter(col => col.name.toLowerCase().trim() === fieldName.toLowerCase().trim());

            if (column.length === 0) {
                subject.error('Column ' + column + ' does not exist');
            } else {
                const access = this.getRuleTableFromStore(tableName, moduleName).readAccessSignature;

                this.storageDataService.readRows(table.tableUniqueName, access)
                    .subscribe(res => {
                        const rows: any = JSON.parse(res);

                        if (rows) {
                            const mappedRows: Array<any> = rows.value;
                            const id = 'c' + column[0].id;

                            const columnValues = mappedRows.map(mappedRow => mappedRow[id]);

                            subject.next(columnValues);
                            subject.complete();
                        } else {
                            subject.next(null);
                            subject.complete();
                        }
                    });
            }
        }, err => {
            subject.error(err);
        });

        return subject;
    }

    removeCachedTable(uniqueTableName: string) {
        this.cachedTables = this.cachedTables.filter(table => table.tableUniqueName !== uniqueTableName);
    }

    private getRuleTableFromStore(tableName: string, moduleName: string): Untold.ClientRuleTable {
        const module = this.realmTableService.getCurrent().filter(md => moduleName === md.name);

        if (module.length === 0) {
            return null;
        }

        const tables = module[0].tables.filter(tb => tb.name === tableName);

        if (tables.length === 0) {
            return null;
        }

        return tables[0];
    }

    private getFilter(column: Untold.ClientRuleTableColumn, value: string | number): string {
        switch (column.type) {
            case 'text':
                return 'c' + column.id + ' eq \'' + (typeof(value) === 'string' ? value : value.toString()) + '\'';
            case 'number':
                return 'c' + column.id + ' eq ' + (typeof(value) === 'number' ? value : parseFloat(value));
            case 'bool':
                return 'c' + column.id + ' eq ' + (value ? 'true' : 'false');
            default:
                return null;
        }
    }
}
