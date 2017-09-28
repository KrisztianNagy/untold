import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subject } from 'rxjs/Subject';

import { Untold } from '../../models/backend-export';
import { Sheet } from '../../../store/models/sheet';
import { StorageDataService } from '../rest/storage-data.service';
import { SheetTableRow } from '../../models/data-table';

@Injectable()
export class SheetEnhancerService {

  constructor(private storageDataService: StorageDataService) { }

  deleteSheet(sheet: Sheet, realm: Untold.ClientRealm): Observable<Response> {
    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      html1: sheet.html,
      css1: sheet.css,
      html2: '',
      html3: '',
      css2: '',
      html4: ''
    };

    return this.storageDataService.delete(tableRow, 'RM' + realm.id + 'Sheets', realm.sheetEditorAcccessSignature);
  }

  getClientSheet(sheet: Sheet): Untold.ClientSheet {
    const clientSheet = JSON.parse(JSON.stringify(sheet));
    delete clientSheet.html;
    delete clientSheet.css;

    return clientSheet;
  }

  saveSheetContent(sheet: Sheet, realm: Untold.ClientRealm) {

    const htmlChunks = this.splitTextContent(sheet.html, 30000);
    const cssChunks = this.splitTextContent(sheet.css, 30000);

    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      html1: htmlChunks.length ? htmlChunks[0] : '',
      html2: htmlChunks.length > 1 ? htmlChunks[1] : '',
      html3: htmlChunks.length > 2 ? htmlChunks[2] : '',
      html4: htmlChunks.length > 3 ? htmlChunks[3] : '',
      css1: cssChunks.length ? cssChunks[0] : '',
      css2: cssChunks.length > 1 ? cssChunks[1] : '',
    };

    return this.storageDataService.insertOrUpdate(tableRow, 'RM' + realm.id + 'Sheets', realm.sheetEditorAcccessSignature);
  }

  loadSheet(sheet: Untold.ClientSheet, realm: Untold.ClientRealm): AsyncSubject<Sheet> {
    const subject = new AsyncSubject<Sheet>();

    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      html1: '',
      html2: '',
      html3: '',
      html4: '',
      css1: '',
      css2: ''
    };

    this.storageDataService.readRow('RM' + realm.id + 'Sheets', 'sheet', sheet.id.toString(), realm.sheetReaderAcccessSignature)
      .subscribe(res => {
        const storageSheet = JSON.parse(res);

        const loadedSheet: Sheet = JSON.parse(JSON.stringify(sheet));
        loadedSheet.html = this.mergeTableProperties(storageSheet, 'html', 4);
        loadedSheet.css = this.mergeTableProperties(storageSheet, 'css', 2);

        subject.next(loadedSheet);
        subject.complete();
      }, err => {
        const loadedSheet: Sheet = JSON.parse(JSON.stringify(sheet));
        loadedSheet.html = '';
        loadedSheet.css = '';

        subject.next(loadedSheet);
        subject.complete();
      });

    return subject;
  }

  mergeTableProperties(storageSheet: any, propertyName: string, length: number) {
    let result = '';

    for (let i = 0; i < length; i++) {
      result += storageSheet && storageSheet[propertyName + i] ? storageSheet[propertyName + i] : '';
    }

    return result;
  }

  splitTextContent(content: string, maxSize: number): Array<string> {
    const result = [];
    let pos = 0;

    while (pos < content.length) {
      result.push( content.substring(pos, pos + maxSize));
      pos += maxSize;
    }

    return result;
  }
}
