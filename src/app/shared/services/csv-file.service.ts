import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { saveAs } from 'file-saver';

import { AzureTableRow, DataTable } from '../models/data-table';

@Injectable()
export class CsvFileService {

  constructor() { }

  saveRuleTable(dataTable: DataTable) {
    const header = dataTable.columns.map(col => this.escapeComma(col.name)) + '\r\n';

    const text = header + dataTable.rows.map(row => {
      return dataTable.columns.map(col => this.escapeComma(row['c' + col.id])).join(',');
    }).join('\r\n');

    const file = new Blob([text],  {type: 'text/plain;charset=utf-8'});

    saveAs(file, dataTable.name + '.csv');
  }

  escapeComma(text: string) {
    if (!text) {
      return '';
    }

    return text.indexOf(',') > 0 ? '"' + text + '"' : text;
  }

  parseCsv(file: File): Subject<PapaParse.ParseResult> {
    const subject = new Subject<PapaParse.ParseResult>();

    Papa.parse(file, {
      header: true,
      complete: results => {
        subject.next(results);
      }
    });

    return subject;
  }

}
