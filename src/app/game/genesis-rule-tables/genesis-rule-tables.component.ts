import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ApplicationRef, NgZone} from '@angular/core';
import 'rxjs/add/operator/max';
import 'rxjs/add/operator/map';

import { SelectItem } from 'primeng/primeng';

import { GenesisDataService } from '../../shared/services/rest/genesis-data.service';
import { GameService } from '../../store/services/game.service';
import { Untold } from '../../shared/models/backend-export';
import { TableStorageService } from '../../shared/services/table-storage.service';
import { RealmTableService } from '../../store/services/realm-table.service';
import { RealmHubSenderService } from '../../shared/services/realm-hub-sender.service';

@Component({
  selector: 'app-genesis-rule-tables',
  templateUrl: './genesis-rule-tables.component.html',
  styleUrls: ['./genesis-rule-tables.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenesisRuleTablesComponent implements OnInit, OnDestroy {
  modules: Array<SelectItem>;
  tables: Array<SelectItem>;
  realmTables: Array<Untold.ClientModuleTables>;
  selectedModule: Untold.ClientModuleTables;
  ruleTables: Array<Untold.ClientRuleTable>;
  selectedTable: Untold.ClientRuleTable;
  isDeleteVisible: boolean;
  importMode: boolean;
  createdTableGuid: string;
  private tableSubscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private genesisDataService: GenesisDataService,
              private gameService: GameService,
              private tableStorageService: TableStorageService,
              private realmTableService: RealmTableService,
              private realmHubSenderService: RealmHubSenderService,
              private applicationRef: ApplicationRef,
              private ngZone: NgZone) {
  }

  ngOnInit() {
    this.tableSubscription = this.realmTableService.realmTables.subscribe(realmTables => {
      this.importMode = false;
      this.realmTables = realmTables;
      this.ngZone.run(() => {
        this.prepareDropDowns();
      });
    });
  }

  ngOnDestroy() {
    this.tableSubscription.unsubscribe();
  }

  prepareDropDowns() {
    this.modules = this.realmTables.map(rt => {
      return {
       label: rt.name,
       value: rt
     };
    });

    if (this.selectedModule) {
      const matching = this.realmTables.filter(rt => rt.id === this.selectedModule.id);
      this.selectedModule = matching.length ? JSON.parse(JSON.stringify(matching[0])) : null;
    }

    if (!this.selectedModule && this.modules.length ) {
      this.selectedModule = this.modules[0].value;
    }

    if (this.selectedModule) {
      this.tables = this.selectedModule.tables.map(rt => {
        return {
         label: rt.name,
         value: JSON.parse(JSON.stringify(rt))
       };
      });
    } else {
      this.tables = [];
    }

    if (this.createdTableGuid) {
      const matching = this.selectedModule.tables.filter(table => table.tableGuid === this.createdTableGuid);
      this.selectedTable = matching.length ? matching[0] : null;

      this.createdTableGuid = null;
    } else if (this.selectedTable) {
      const matching = this.selectedModule.tables.filter(table => table.tableGuid === this.selectedTable.tableGuid);
      this.selectedTable = matching.length ? matching[0] : null;
    }

    if (!this.selectedTable && this.selectedModule.tables.length ) {
      this.selectedTable = this.selectedModule.tables[0];
    }

    this.changeDetectorRef.detectChanges();
  }

  showImport() {
    this.importMode = true;
  }

  createTable() {

    const table: Untold.ClientRuleTable = {
      columns: [],
      editorAccessSignature: '',
      moduleGuid: this.selectedModule.guid,
      name: '',
      readAccessSignature: '',
      tableGuid: null,
      uniqueTableName: ''
    };

    this.genesisDataService.createRuletableSchema(this.selectedModule.id, table)
    .subscribe(resp => {

      const resultTable: Untold.ClientRuleTable = JSON.parse(resp.text());
      this.createdTableGuid = <string> resultTable.tableGuid;
      this.realmHubSenderService.reloadRealmTableModules({
        moduleId: this.selectedModule.id,
        realmId: this.gameService.getCurrent().realm.id
      });
      this.changeDetectorRef.markForCheck();
    });
 }

  deleteTable(ruleTable: Untold.ClientRuleTable) {
    const modId = this.selectedModule.id;
    const tableReference: Untold.ClientRuleTableReference = {
      realmId: this.gameService.getCurrent().realm.id,
      uniqueTableName: ruleTable.uniqueTableName,
      'moduleId': modId
    };

    tableReference.moduleId = modId;
    this.genesisDataService.deleteRuleTable(modId, ruleTable)
      .subscribe(() => {
        this.realmTableService.deleteRealmTable(tableReference);
        this.realmHubSenderService.realmTableDeleted(tableReference);
      });
  }
}
