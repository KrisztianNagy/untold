import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subject } from 'rxjs/Subject';

import { Untold } from '../../models/backend-export';
import { Sheet, SheetTab,  } from '../../../store/models/sheet';
import { SheetElement } from '../../../shared/models/sheet-element';
import { StorageDataService } from '../rest/storage-data.service';
import { SheetTableRow } from '../../models/data-table';
import { DefinitionEnhancerService } from './definition-enhancer.service';
declare var LZString;

@Injectable()
export class SheetEnhancerService {

  constructor(private storageDataService: StorageDataService,
              private definitionEnhancerService: DefinitionEnhancerService) { }

  deleteSheet(sheet: Sheet, realm: Untold.ClientRealm): Observable<Response> {
    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      json: '',
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
    const compressedJson = LZString.compressToUTF16(sheet.json ? JSON.stringify(sheet.json) : '');
    const compressedScripts = LZString.compressToUTF16(sheet.scripts ? JSON.stringify(sheet.scripts) : '');

    const tableRow: SheetTableRow = {
      PartitionKey: 'sheet',
      RowKey: sheet.id.toString(),
      rowStatus: 1,
      json: compressedJson,
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
      json: '',
      scripts: ''
    };

    this.storageDataService.readRow('RM' + realm.id + 'Sheets', 'sheet', sheet.id.toString(), realm.sheetReaderAcccessSignature)
      .subscribe(res => {
        const storageSheet = JSON.parse(res);

        const loadedSheet: Sheet = JSON.parse(JSON.stringify(sheet));
        loadedSheet.json = [];
        loadedSheet.scripts = [];

        if (storageSheet['scripts'] ) {
          try {
              const scripts = LZString.decompressFromUTF16(storageSheet['scripts']);
              loadedSheet.scripts = JSON.parse(scripts);

          } catch (err) {
            console.error('Error occured during sheet command building: ' + err);
          }
        }

        if (storageSheet['json'] ) {
          try {
              const json = LZString.decompressFromUTF16(storageSheet['json']);
              loadedSheet.json = JSON.parse(json);

          } catch (err) {
            console.error('Error occured during sheet command building: ' + err);
          }
        }

        subject.next(loadedSheet);
        subject.complete();
      }, err => {
        const loadedSheet: Sheet = JSON.parse(JSON.stringify(sheet));
        loadedSheet.json = [];
        loadedSheet.scripts = [];

        subject.next(loadedSheet);
        subject.complete();
      });

    return subject;
  }

  getSheetHtml(sheet: Sheet, definition: Untold.ClientDefinition) {
    // tslint:disable-next-line:max-line-length
    let baseHtml = `<link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/pure-min.css" integrity="sha384-nn4HPE8lTHyVtfCBi5yW9d20FjT8BJwUXyWZT9InLYax14RDjBj46LmSztkmNP9w" crossorigin="anonymous">

      <main>`;
    if (sheet.json && sheet.json.length) {
      if (sheet.json.length === 1) {
        baseHtml += '<div class="pure-form"><div class="pure-g">';
        baseHtml += this.getSheetContent(sheet.json[0].sheet, <Untold.ClientInnerDefinition> definition, 'entity', 0);
        baseHtml += '</div></div>';
      } else {
        baseHtml += this.getSheetTabHeaderHthml(sheet);

        baseHtml += sheet.json.map((tab, index) => {
          let tabHtml = '<section id="content' + (index + 1) + '" class="tab-section">';
          tabHtml += this.getSheetContent(tab.sheet, <Untold.ClientInnerDefinition> definition, 'entity', 0);
          tabHtml += '</section>';

          return tabHtml;
        }).join('');
      }
    }

    baseHtml += '</main>';

    return baseHtml;
  }

  getSheetTabHeaderHthml(sheet: Sheet): string {
    if (sheet.json && sheet.json.length > 1) {
      const html = sheet.json.map((tab, index) => {
        // tslint:disable-next-line:max-line-length
        let tabHtml = '<input class="tab-input" id="tab' + (index + 1) + '" type="radio" name="tabs"' + (index === 0 ? 'checked' : '') + '>';
        tabHtml += '<label class="tab-label" for="tab' + (index + 1) + '">' + tab.name + '</label>';

        return html;
      }).join('');

      return html;
    }

    return '';
  }

  getSheetContent(sheetElement: SheetElement, definition: Untold.ClientInnerDefinition, modelMapping: string, listNumber: number): string {
    let elementHtml = ''

    if (sheetElement.type === 'root') {
      elementHtml += this.getSheetRootContent(sheetElement, definition, modelMapping, listNumber);
    }

    if (sheetElement.type === 'grid') {
      elementHtml += this.getSheetGridContent(sheetElement, definition, modelMapping, listNumber);
    }

    if (sheetElement.type === 'text') {
      elementHtml += this.getSheetTextContent(sheetElement, definition, modelMapping, listNumber);
    }

    if (sheetElement.type === 'property') {
      elementHtml += this.getSheetPropertyContent(sheetElement, definition, modelMapping, listNumber);
    }

    if (sheetElement.type === 'button') {
      elementHtml += this.getSheetButtonContent(sheetElement, definition, modelMapping, listNumber);
    }

    return elementHtml;
  }

  // tslint:disable-next-line:max-line-length
  getSheetRootContent(sheetElement: SheetElement, definition: Untold.ClientInnerDefinition, modelMapping: string, listNumber: number): string {
    let elementHtml = '<div >';
    elementHtml += sheetElement.innerElements.map(element => {
      return(this.getSheetContent(element, definition, modelMapping, listNumber));
    }).join('');
    elementHtml += '</div>';

    return elementHtml;
  }

  // tslint:disable-next-line:max-line-length
  getSheetGridContent(sheetElement: SheetElement, definition: Untold.ClientInnerDefinition, modelMapping: string, listNumber: number): string {
    // tslint:disable-next-line:max-line-length
    let elementHtml = '<div class="pure-u-' + sheetElement.numerator + (sheetElement.denominator ? '-' + sheetElement.denominator : '' ) + '">';

    if (sheetElement.content) {
      elementHtml += '<legend style="text-align: center">' + sheetElement.content + '</legend>';
    }

    elementHtml += sheetElement.innerElements.map(element => {
      return(this.getSheetContent(element, definition, modelMapping, listNumber));
    }).join('');
    elementHtml += '</div>';

    return elementHtml;
  }

  // tslint:disable-next-line:max-line-length
  getSheetTextContent(sheetElement: SheetElement, definition: Untold.ClientInnerDefinition, modelMapping: string, listNumber: number): string {
    let elementHtml = '<div style="text-align: center">';
    elementHtml += '<span style="text-align: center;letter-spacing: 0;">' + sheetElement.content + '</span>';
    elementHtml += '</div>';

    return elementHtml;
  }

  // tslint:disable-next-line:max-line-length
  getSheetPropertyContent(sheetElement: SheetElement, definition: Untold.ClientInnerDefinition, modelMapping: string, listNumber: number): string {
    // tslint:disable-next-line:max-line-length
    const selectedDefinition = this.definitionEnhancerService.getInnerDefinition(definition, sheetElement.definitionOccurenceGuid);
    modelMapping += '[\'' + selectedDefinition.name + '\']';
    const htmlId = selectedDefinition.name.replace(/ /g, '_');

    let elementHtml = '';

    if (selectedDefinition.isList) {
      listNumber++;
      const listId = 'list' + listNumber;
      if (selectedDefinition.isPredefinedList) {
        // tslint:disable-next-line:max-line-length
        elementHtml += '<div *ngFor="let ' + listId + ' of ' + '[' + selectedDefinition.predefinedListItems.map(item => '\'' + item + '\'') + ']">\n';
        modelMapping += '[' + listId + ']';
      } else {
        elementHtml += '<div *ngFor="let ' + listId + ' of ' + modelMapping + '">\n';
      }

      elementHtml += sheetElement.innerElements.map(element => {
        return(this.getSheetContent(element, definition, modelMapping, listNumber));
      }).join('');

      elementHtml += '</div>';
    } else {
      if (sheetElement.propertyType === 'text') {
        let ngExtend = selectedDefinition.isCalculated ?
        'readonly="readonly" (ngModel)="' + modelMapping + '"' :
        '[(ngModel)]="' + modelMapping + '"';

        if (sheetElement.content) {
          elementHtml += '<label for="' + htmlId + '">' + sheetElement.content + '</label>';
        }

        ngExtend += ' class="pure-u-23-24"';

        elementHtml += '<input type="text"  id="' + htmlId + '" ' + ngExtend + '>';
      }

      if (sheetElement.propertyType === 'number') {
        let ngExtend = selectedDefinition.isCalculated ?
        'readonly="readonly" (ngModel)="' + modelMapping + '"' :
        '[(ngModel)]="' + modelMapping + '"';

        if (sheetElement.content) {
          elementHtml += '<label for="' + htmlId + '">' + sheetElement.content + '</label>';
        }

        ngExtend += ' class="pure-u-23-24"';

        elementHtml += '<input type="number"  id="' + htmlId + '" ' + ngExtend + '>';
      }

      if (sheetElement.propertyType === 'bool') {
        const ngExtend = selectedDefinition.isCalculated ?
        'readonly="readonly" (ngModel)="' + modelMapping + '"' :
        '[(ngModel)]="' + modelMapping + '"';

        elementHtml += '<label for="' + htmlId + '">';
        elementHtml += '<input id="' + htmlId + '" type="checkbox" ' + ngExtend + '>' + sheetElement.content
        elementHtml += '</label>';

        elementHtml += '<input type="number"  id="' + htmlId + '" ' + ngExtend + '>';
      }

      if (sheetElement.propertyType === 'choice') {
        if (sheetElement.content) {
          elementHtml += '<label for="' + htmlId + '">' + sheetElement.content + '</label>';
        }

        // tslint:disable-next-line:max-line-length
        elementHtml += '<select type="text" [(ngModel)]="' + modelMapping + '" id="' + htmlId + '" class="pure-u-23-24">';
        elementHtml += '<option *ngFor="let choiceOption of getChoiceOptions(' + modelMapping + ')" [ngValue]="modelMapping"> {{choiceOption}}</option>'
        elementHtml += '</select>';
      }
    }

    return elementHtml;
  }

  // tslint:disable-next-line:max-line-length
  getSheetButtonContent(sheetElement: SheetElement, definition: Untold.ClientInnerDefinition, modelMapping: string, listNumber: number): string {
    let ngExtend = '';

    if (sheetElement.chat) {
      ngExtend = '(click)="chat(\'' + sheetElement.chat + '\')"';
    }

    let elementHtml = '<button class="pure-button" ' + ngExtend + '>'
    elementHtml += sheetElement.content ? sheetElement.content : 'Button';
    elementHtml += '</button>';

    return elementHtml;
  }

  getSheetCss(sheet: Sheet): string {
    let baseCss = `
    @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600,700');

    section.tab-section {
      display: none;
      padding: 20px 0 0;
      border-top: 1px solid #ddd;
    }

    input.tab-input {
      display: none;
    }

    label.tab-label {
      display: inline-block;
      margin: 0 0 -1px;
      padding: 15px 25px;
      font-weight: 600;
      text-align: center;
      color: #bbb;
      border: 1px solid transparent;
    }

    label.tab-label:before {
      font-family: fontawesome;
      font-weight: normal;
      margin-right: 10px;
    }

    label.tab-label:hover {
      color: #888;
      cursor: pointer;
    }

    input.tab-input:checked + label {
      color: #555;
      border: 1px solid #ddd;
      border-top: 2px solid orange;
      border-bottom: 1px solid #fff;
    }

    @media screen and (max-width: 650px) {
      label.tab-label {
        font-size: 0;
      }
      label.tab-label:before {
        margin: 0;
        font-size: 18px;
      }
    }

    @media screen and (max-width: 400px) {
      label.tab-label {
        padding: 15px;
      }
    }

    `;

    sheet.json.forEach((tab, index) => {
      if (index > 0) {
        baseCss += ','
      }

      baseCss += '\n#tab' + (index + 1) + ':checked ~ #content' + (index + 1);
    });

    if (sheet.json.length > 0) {
      baseCss += `{
        display: block;
      }`
    }

    return baseCss;
  }
}
