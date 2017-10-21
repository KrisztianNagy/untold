import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subject } from 'rxjs/Subject';

import { Untold } from '../../models/backend-export';
import { Sheet } from '../../../store/models/sheet';
import { StorageDataService } from '../rest/storage-data.service';
import { SheetTableRow } from '../../models/data-table';
declare var LZString;

@Injectable()
export class SheetEnhancerService {

  constructor(private storageDataService: StorageDataService) { }

  deleteSheet(sheet: Sheet, realm: Untold.ClientRealm): Observable<Response> {
    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      html: '',
      css: '',
      scripts: ''
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
    const compressedHTML = LZString.compressToUTF16(sheet.html ? sheet.html : '');
    const compressedCSS = LZString.compressToUTF16(sheet.css ? sheet.css : '');
    const compressedScripts = LZString.compressToUTF16(sheet.scripts ? JSON.stringify(sheet.scripts) : '');

    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      html: compressedHTML,
      css: compressedCSS,
      scripts: compressedScripts
    };

    return this.storageDataService.insertOrUpdate(tableRow, 'RM' + realm.id + 'Sheets', realm.sheetEditorAcccessSignature);
  }

  loadSheet(sheet: Untold.ClientSheet, realm: Untold.ClientRealm): AsyncSubject<Sheet> {
    const subject = new AsyncSubject<Sheet>();

    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      html: '',
      css: '',
      scripts: ''
    };

    this.storageDataService.readRow('RM' + realm.id + 'Sheets', 'sheet', sheet.id.toString(), realm.sheetReaderAcccessSignature)
      .subscribe(res => {
        const storageSheet = JSON.parse(res);

        const loadedSheet: Sheet = JSON.parse(JSON.stringify(sheet));
        loadedSheet.html = storageSheet['html'] ? LZString.decompressFromUTF16(storageSheet['html']) : '';
        loadedSheet.css = storageSheet['css'] ? LZString.decompressFromUTF16(storageSheet['css']) : '';
        loadedSheet.scripts = [];

        if (storageSheet['scripts'] ) {
          try {
              const scripts = LZString.decompressFromUTF16(storageSheet['scripts']);
              loadedSheet.scripts = JSON.parse(scripts);

          } catch (err) {
            console.error('Error occured during sheet command building: ' + err);
          }
        }

        subject.next(loadedSheet);
        subject.complete();
      }, err => {
        const loadedSheet: Sheet = JSON.parse(JSON.stringify(sheet));
        loadedSheet.html = '';
        loadedSheet.css = '';
        loadedSheet.scripts = [];

        subject.next(loadedSheet);
        subject.complete();
      });

    return subject;
  }
}
