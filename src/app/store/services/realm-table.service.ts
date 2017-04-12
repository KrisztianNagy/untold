import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppStore } from '../app-store';
import { Untold } from '../../shared/models/backend-export';
import { RealmTableActions } from '../actions/realm-table.actions';

@Injectable()
export class RealmTableService {
    realmTables: Observable<Untold.ClientModuleTables[]>;
    private current: Untold.ClientModuleTables[];

    constructor(private store: Store<AppStore>) {
    this.realmTables = this.store.select(s => s.RealmTables);

    this.realmTables.subscribe(rt => {
      this.current = rt;
    });
  }

  updateRealmTables(realmTables: Untold.ClientModuleTables[]) {
    this.store.dispatch({ type: RealmTableActions.SET_REALMTABLES, payload: realmTables });
  }

  deleteRealmTable(realmTableReference: Untold.ClientRuleTableReference) {
    if (!this.current) {
      return;
    }

    const realmTables: Untold.ClientModuleTables[] = JSON.parse(JSON.stringify(this.current));

    realmTables.forEach(mod => {
      if (mod.id === realmTableReference.moduleId) {
        mod.tables = mod.tables.filter(tbl => tbl.uniqueTableName !== realmTableReference.uniqueTableName);
      }
    });

    this.store.dispatch({ type: RealmTableActions.SET_REALMTABLES, payload: realmTables });
  }

  getCurrent(): Untold.ClientModuleTables[] {
    return this.current;
  }
}
