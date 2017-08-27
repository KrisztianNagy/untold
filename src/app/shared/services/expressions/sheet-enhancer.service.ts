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
      html: sheet.html,
      css: sheet.css
    };

    return this.storageDataService.delete(tableRow, 'RM' + realm.id + 'Sheets', realm.entityEditorAcccessSignature);
  }

  getClientSheet(sheet: Sheet): Untold.ClientSheet {
    let clientSheet = JSON.parse(JSON.stringify(sheet));
    delete clientSheet.html;
    delete clientSheet.css;

    return clientSheet;
  }
  
  saveSheetContent(sheet: Sheet, realm: Untold.ClientRealm) {
    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      html: sheet.html,
      css: sheet.css
    };

    return this.storageDataService.insertOrUpdate(tableRow, 'RM' + realm.id + 'Sheets', realm.entityEditorAcccessSignature);
  }

  loadSheet(sheet: Untold.ClientSheet, realm: Untold.ClientRealm): AsyncSubject<Sheet> {
    const subject = new AsyncSubject<Sheet>();

    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      html: '',
      css: ''
    };

    this.storageDataService.readRow('RM' + realm.id + 'Sheets', 'sheet', sheet.id.toString(), realm.entityReaderAcccessSignature)
      .subscribe(res => {
        const storageSheet = JSON.parse(res);

        const loadedSheet: Sheet = JSON.parse(JSON.stringify(sheet));
        loadedSheet.html = storageSheet && storageSheet['html'] ? storageSheet['html'] : '';
        loadedSheet.css = storageSheet && storageSheet['css'] ? storageSheet['css'] : '';

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

}
