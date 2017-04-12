import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { MenuItem, SelectItem } from 'primeng/primeng';

import { GenesisDataService } from '../../../shared/services/rest/genesis-data.service';
import { Untold, System, ClientModuleTables } from '../../../shared/models/backend-export';
import { CsvFileService } from '../../../shared/services/csv-file.service';
import { TableStorageService } from '../../../shared/services/table-storage.service';

@Component({
  selector: 'app-rule-table-import-wizard',
  templateUrl: './rule-table-import-wizard.component.html',
  styleUrls: ['./rule-table-import-wizard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuleTableImportWizardComponent implements OnInit {
  @Input() module: ClientModuleTables;
 
  private keyValueColumns: Array<string>;

  stepsMenu: MenuItem[];
  currentStep: number;
  tableName: string;
  file: File;
  parsedCsv: PapaParse.ParseResult;
  columnTypes: Array<SelectItem>;
  columns: Array<Untold.ClientRuleTableColumn>;
  progressMeter: number;
  progressMessage: string;
  uploading: boolean;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private csvFileService: CsvFileService,
              private genesisDataService: GenesisDataService,
              private tableStorageService: TableStorageService) { }

  ngOnInit() {
    this.currentStep = 0;

    this.stepsMenu = [
      {label: 'Select file'},
      {label: 'Configure columns'},
      {label: 'Import'},
      {label: 'Complete'}
    ];

    this.columnTypes = [];
    this.columnTypes.push({label: 'Text', value: 'text'});
    this.columnTypes.push({label: 'Number', value: 'number'});
    this.columnTypes.push({label: 'Yes/No', value: 'bool'});

    this.columns = [];
  }

  importCsv() {
    $('#csvinput').click();

    let fileInput = document.getElementById('csvinput');
    fileInput.removeEventListener('change');

    fileInput.addEventListener('change', () => {
      this.file = (<any>fileInput).files[0];
      if (this.file) {
        let sub = this.csvFileService.parseCsv(this.file)
          .subscribe(csv => {
            this.parsedCsv = csv;
            this.currentStep = 1;
            sub.unsubscribe();

            let index = 0;
            this.columns = this.parsedCsv.meta.fields.map(field => {
              index++;

              return {
                id: index,
                name: field,
                type: 'text',
                order: index,
                deleted: false,
                rowKey: this.tableStorageService.padNumber(index)
              };
            });
          });
      }
    });
  }

  gotoImport() {
    this.currentStep = 2;
  }

  uploadCsv() {
    this.uploading = true;
    let index = 1;
    let step = Math.floor(100 / (Math.ceil(this.parsedCsv.data.length / 100) + 1));
    this.progressMeter = 0;
    this.progressMessage = 'Creating table.';

    const ruleTable: Untold.ClientRuleTable = {
      moduleGuid: this.module.guid,
      name: this.tableName,
      columns: this.columns,
      tableGuid: '',
      uniqueTableName: '',
      editorAccessSignature: '',
      readAccessSignature: ''
    };

    this.genesisDataService.createRuletableSchema(this.module.id, ruleTable)
    .map(res => res.text())
    .subscribe(resp => {
      const rt: Untold.ClientRuleTable = JSON.parse(resp);
      const maxPos = this.parsedCsv.data.length - 1;

      let queue = new Subject<number>();

      let subs = queue.subscribe(start => {
        if (this.parsedCsv.data.length > start ) {
          this.progressMeter += step;
          this.changeDetectorRef.markForCheck();

          this.bulkUploadNext(start, maxPos, rt.uniqueTableName, <string> rt.tableGuid).subscribe(() => {
            this.progressMeter += step;
            queue.next(start + 100);
          });

        } else {
          setTimeout(() => {
            this.uploading = false;
            subs.unsubscribe();
            this.currentStep = 3;
            this.changeDetectorRef.markForCheck();
          }, 1000);
        }
      });

      queue.next(0);
    }, () => {
      this.uploading = false;
      console.log('TODO: hande error');
    });

  }

  bulkUploadNext(start: number, maxPos: number, tabeUniqueName: string, tableGuid: string) {
    const end = this.parsedCsv.data.length - start > 100 ? start + 100 : this.parsedCsv.data.length;

    this.progressMessage = 'Uploading: ' + (start + 1) + ' to ' + end ;

    let entities = this.parsedCsv.data
      .filter((row, index: number) => index >= start && index < end)
      .map((row, index: number): Untold.ClientRuleTableBulkInsertEntity => {
        let properties: Array<string> = [];

        this.parsedCsv.meta.fields.forEach(field => {
          if (row[field]) {
            properties.push(row[field]);
          } else  {
            properties.push('');
          }
        });

        return {
          partitionKey: 'row',
          rowKey: this.tableStorageService.padNumber(index),
          properties: properties
        };
      });

    let bulk: Untold.ClientRuleTableBulkInsert = {
      columns: this.columns,
      tableUniqueName: tabeUniqueName,
      tableGuid: tableGuid,
      entities: entities
    };

    return this.genesisDataService.bulkInsertRuleTable(this.module.id, bulk);
  }
}
