import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subject } from 'rxjs/Subject';

import { Untold } from '../../models/backend-export';
import { Sheet, SheetTab } from '../../../store/models/sheet';
import { SheetElement, SheetProcessingParameters, SheetModel } from '../../../shared/models/sheet-element';
import { StorageDataService } from '../rest/storage-data.service';
import { SheetTableRow } from '../../models/data-table';
import { DefinitionEnhancerService } from './definition-enhancer.service';
import { CalculatedExpressionService } from './calculated-expression.service';
import { CommandExpressionService } from './command-expression.service';
declare var LZString;

@Injectable()
export class SheetEnhancerService {

  constructor(private storageDataService: StorageDataService,
              private definitionEnhancerService: DefinitionEnhancerService,
              private calculatedExpressionService: CalculatedExpressionService,
              private commandExpressionService: CommandExpressionService) { }

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

  getSheetHtml(sheet: Sheet, definition: Untold.ClientInnerDefinition) {
    // tslint:disable-next-line:max-line-length
    let baseHtml = `<link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/pure-min.css" integrity="sha384-nn4HPE8lTHyVtfCBi5yW9d20FjT8BJwUXyWZT9InLYax14RDjBj46LmSztkmNP9w" crossorigin="anonymous">

      <main>`;
    if (sheet.json && sheet.json.length) {
      if (sheet.json.length === 1) {

        const sheetProcessingParameters: SheetProcessingParameters = {
          sheetElement: sheet.json[0].sheet,
          definitions: [definition],
          listNumber: 0,
          sheetModels: [{
            entity: null,
            name: 'entity',
            definition: definition
          }],
          modelMapping: 'entity'
        };

        baseHtml += '<div class="pure-form"><div class="pure-g">';
        baseHtml += this.getSheetContent(sheetProcessingParameters);
        baseHtml += '</div></div>';
      } else {
        baseHtml += this.getSheetTabHeaderHthml(sheet);

        baseHtml += sheet.json.map((tab, index) => {

          const sheetProcessingParameters: SheetProcessingParameters = {
            sheetElement: tab.sheet,
            definitions: [definition],
            listNumber: 0,
            sheetModels: [{
              entity: null,
              name: 'entity'
            }],
            modelMapping: 'entity'
          } ;

          let tabHtml = '<section id="content' + (index + 1) + '" class="tab-section">';
          tabHtml += this.getSheetContent(sheetProcessingParameters);
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

  // tslint:disable-next-line:max-line-length
  getSheetContent(sheetProcessingParameters: SheetProcessingParameters): string {
    let elementHtml = '';

    if (sheetProcessingParameters.sheetElement.type === 'root') {
      elementHtml += this.getSheetRootContent(sheetProcessingParameters);
    }

    if (sheetProcessingParameters.sheetElement.type === 'grid') {
      elementHtml += this.getSheetGridContent(sheetProcessingParameters);
    }

    if (sheetProcessingParameters.sheetElement.type === 'text') {
      elementHtml += this.getSheetTextContent(sheetProcessingParameters);
    }

    if (sheetProcessingParameters.sheetElement.type === 'property') {
      elementHtml += this.getSheetPropertyContent(sheetProcessingParameters);
    }

    if (sheetProcessingParameters.sheetElement.type === 'button') {
      elementHtml += this.getSheetButtonContent(sheetProcessingParameters);
    }

    return elementHtml;
  }

  // tslint:disable-next-line:max-line-length
  getSheetRootContent(sheetProcessingParameters: SheetProcessingParameters): string {
    let elementHtml = '<div >';
    elementHtml += sheetProcessingParameters.sheetElement.innerElements.map(element => {
      sheetProcessingParameters = JSON.parse(JSON.stringify(sheetProcessingParameters));
      sheetProcessingParameters.sheetElement = element;
      return(this.getSheetContent(sheetProcessingParameters));
    }).join('');
    elementHtml += '</div>';

    return elementHtml;
  }

  getSheetGridContent(sheetProcessingParameters: SheetProcessingParameters): string {

    // tslint:disable-next-line:max-line-length
    let elementHtml = '<div class="pure-u-' + sheetProcessingParameters.sheetElement.numerator + (sheetProcessingParameters.sheetElement.denominator ? '-' + sheetProcessingParameters.sheetElement.denominator : '' ) + '">';

    if (sheetProcessingParameters.sheetElement.content) {
      elementHtml += '<legend style="text-align: center">' + sheetProcessingParameters.sheetElement.content + '</legend>';
    }

    elementHtml += sheetProcessingParameters.sheetElement.innerElements.map(element => {
      sheetProcessingParameters = JSON.parse(JSON.stringify(sheetProcessingParameters));
      sheetProcessingParameters.sheetElement = element;

      return(this.getSheetContent(sheetProcessingParameters));
    }).join('');
    elementHtml += '</div>';

    return elementHtml;
  }

  getSheetTextContent(sheetProcessingParameters: SheetProcessingParameters): string {
    let elementHtml = '<div style="text-align: center">';
    elementHtml += '<span style="text-align: center;letter-spacing: 0;">' + sheetProcessingParameters.sheetElement.content + '</span>';
    elementHtml += '</div>';

    return elementHtml;
  }

  getSheetPropertyContent(sheetProcessingParameters: SheetProcessingParameters): string {
    sheetProcessingParameters = JSON.parse(JSON.stringify(sheetProcessingParameters));

    const lastDefinition = sheetProcessingParameters.definitions[sheetProcessingParameters.definitions.length - 1];

    // tslint:disable-next-line:max-line-length
    const selectedDefinition = this.definitionEnhancerService.getInnerDefinition(lastDefinition, sheetProcessingParameters.sheetElement.definitionOccurenceGuid);
    sheetProcessingParameters.definitions = [...sheetProcessingParameters.definitions, selectedDefinition];
    sheetProcessingParameters.modelMapping += '[\'' + selectedDefinition.name + '\']';
    const htmlId = selectedDefinition.name.replace(/ /g, '_');

    let elementHtml = '';

    if (selectedDefinition.isList) {
      sheetProcessingParameters.listNumber++;
      const listId = 'list' + sheetProcessingParameters.listNumber;

      if (selectedDefinition.isPredefinedList) {
        const listName = 'listName' + sheetProcessingParameters.listNumber;
        // tslint:disable-next-line:max-line-length
        elementHtml += '<div *ngFor="let ' + listName + ' of ' + '[' + selectedDefinition.predefinedListItems.map(item => '\'' + item + '\'') + '];">\n';
        sheetProcessingParameters.modelMapping =  sheetProcessingParameters.modelMapping + '[' + listName + ']';
        sheetProcessingParameters.sheetModels = [
          ...sheetProcessingParameters.sheetModels,
          {
            entity: null,
            name: listId,
            definition: selectedDefinition
          }];
      } else {
        elementHtml += '<div *ngFor="let ' + listId + ' of ' + sheetProcessingParameters.modelMapping + '">\n';
      }

      elementHtml += sheetProcessingParameters.sheetElement.innerElements.map(element => {
        sheetProcessingParameters = JSON.parse(JSON.stringify(sheetProcessingParameters));
        sheetProcessingParameters.sheetElement = element;
        return(this.getSheetContent(sheetProcessingParameters));
      }).join('');

      elementHtml += '</div>';
    } else {
      if (sheetProcessingParameters.sheetElement.propertyType === 'text') {
        let ngExtend = selectedDefinition.isCalculated ?
        'readonly="readonly" (ngModel)="' + sheetProcessingParameters.modelMapping + '"' :
        '[(ngModel)]="' + sheetProcessingParameters.modelMapping + '"';

        if (sheetProcessingParameters.sheetElement.content) {
          elementHtml += '<label for="' + htmlId + '">' + sheetProcessingParameters.sheetElement.content + '</label>';
        }

        ngExtend += ' class="pure-u-23-24"';

        elementHtml += '<input type="text"  id="' + htmlId + '" ' + ngExtend + '>';
      }

      if (sheetProcessingParameters.sheetElement.propertyType === 'number') {
        let ngExtend = selectedDefinition.isCalculated ?
        'readonly="readonly" [(ngModel)]="' + sheetProcessingParameters.modelMapping + '"' :
        '[(ngModel)]="' + sheetProcessingParameters.modelMapping + '"';

        if (sheetProcessingParameters.sheetElement.content) {
          elementHtml += '<label for="' + htmlId + '">' + sheetProcessingParameters.sheetElement.content + '</label>';
        }

        ngExtend += ' class="pure-u-23-24"';

        elementHtml += '<input type="number"  id="' + htmlId + '" ' + ngExtend + '>';
      }

      if (sheetProcessingParameters.sheetElement.propertyType === 'bool') {
        const ngExtend = selectedDefinition.isCalculated ?
        'readonly="readonly" (ngModel)="' + sheetProcessingParameters.modelMapping + '"' :
        '[(ngModel)]="' + sheetProcessingParameters.modelMapping + '"';

        elementHtml += '<label for="' + htmlId + '">';
        elementHtml += '<input id="' + htmlId + '" type="checkbox" ' + ngExtend + '>' + sheetProcessingParameters.sheetElement.content;
        elementHtml += '</label>';

        elementHtml += '<input type="number"  id="' + htmlId + '" ' + ngExtend + '>';
      }

      if (sheetProcessingParameters.sheetElement.propertyType === 'choice') {
        if (sheetProcessingParameters.sheetElement.content) {
          elementHtml += '<label for="' + htmlId + '">' + sheetProcessingParameters.sheetElement.content + '</label>';
        }

        // tslint:disable-next-line:max-line-length
        elementHtml += '<select type="text" [(ngModel)]="' + sheetProcessingParameters.modelMapping + '" id="' + htmlId + '" class="pure-u-23-24">';
        elementHtml += '<option *ngFor="let choiceOption of getChoiceOptions(' + sheetProcessingParameters.modelMapping + ')"> {{choiceOption}}</option>';
        elementHtml += '</select>';
      }
    }

    return elementHtml;
  }

  // tslint:disable-next-line:max-line-length
  getSheetButtonContent(sheetProcessingParameters: SheetProcessingParameters): string {
    sheetProcessingParameters = JSON.parse(JSON.stringify(sheetProcessingParameters));
    const lastDefinition = sheetProcessingParameters.definitions[sheetProcessingParameters.definitions.length - 1];
    let ngExtend = '';

    if (sheetProcessingParameters.sheetElement.chat) {
      const resolved = this.resolveAngularExpressions('\'' + sheetProcessingParameters.sheetElement.chat + '\'', sheetProcessingParameters);
      ngExtend = '(click)="chat(' + resolved + ')"';
    }

    let elementHtml = '<button class="pure-button" ' + ngExtend + '>';

    const inPredefinedList = sheetProcessingParameters.definitions.some(def => def.isList && def.isPredefinedList);
    if (sheetProcessingParameters.sheetElement.listElementLabelResolve && inPredefinedList) {
      const lists = sheetProcessingParameters.definitions.filter(def => def.isList);
      const indexOf = lists.findIndex(def => def.occurrenceGuid === sheetProcessingParameters.sheetElement.listElementLabelResolve);

      if (indexOf > -1) {
        elementHtml += '{{listName' + (indexOf + 1) + '}}';
      } else {
        elementHtml += 'Missing';
      }

    } else {
      elementHtml += sheetProcessingParameters.sheetElement.content ? sheetProcessingParameters.sheetElement.content : 'Button';
    }

    elementHtml += '</button>';

    return elementHtml;
  }

  resolveAngularExpressions(text: string, sheetProcessingParameters: SheetProcessingParameters) {
    const braceExpression = /\{\{(.*?)\}\}/g;
    const matches = text.match(braceExpression);
    
    if (!matches) {
      return text;
    }

    matches.forEach(match => {
      const resolvedMatch = '';
      const withoutBraces = match.replace(/{/g, '').replace(/}/g, '');
      // TODO: Sanitize angular expressions
      const resolvable = this.validateAngularExpression(sheetProcessingParameters.sheetModels, withoutBraces);

      if (resolvable) {
        text = text.replace(match, '\' + ' +  withoutBraces + ' + \'');
      } else {
        text = text.replace(match, '');
      }
    });

    return text;
  }

  validateAngularExpression(models: SheetModel[], expression: string): boolean {
    const tree = this.calculatedExpressionService.parseTree(expression);
    const resolvable = this.commandExpressionService.resolveNode(tree.tree, models);

    return !!resolvable;
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
        baseCss += ',';
      }

      baseCss += '\n#tab' + (index + 1) + ':checked ~ #content' + (index + 1);
    });

    if (sheet.json.length > 0) {
      baseCss += `{
        display: block;
      }`;
    }

    return baseCss;
  }
}
