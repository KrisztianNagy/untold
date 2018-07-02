import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppStore } from '../app-store';
import { Untold } from '../../shared/models/backend-export';
import { DefinitionActions } from '../actions/definition.actions';

@Injectable()
export class RealmDefinitionService {
    definitions: Observable<Untold.ClientModuleDefinitions[]>;
    private current: Untold.ClientModuleDefinitions[];

  constructor(private store: Store<AppStore>) {
    this.definitions = this.store.select(s => s.RealmDefinitions);

    this.definitions.subscribe(rt => {
      this.current = rt;
    });
  }

  updateRealmDefinition(definition: Untold.ClientDefinition) {
    if (!this.current) {
      return;
    }

    const realmDefinitions: Untold.ClientModuleDefinitions[] = JSON.parse(JSON.stringify(this.current));

    realmDefinitions.forEach(mod => {
      if (mod.guid === definition.moduleGuid) {
        mod.definitions = mod.definitions.map(def => {
          return def.definitionGuid === definition.definitionGuid ? definition : def;
        });
      }
    });

    this.store.dispatch({ type: DefinitionActions.SET_DEFINITIONS, payload: realmDefinitions });
  }

  deleteRealmDefinition(definitionReference: Untold.ClientDefinitionReference) {
    if (!this.current) {
      return;
    }

    const realmDefinitions: Untold.ClientModuleDefinitions[] = JSON.parse(JSON.stringify(this.current));

    realmDefinitions.forEach(mod => {
      if (mod.id === definitionReference.moduleId) {
        mod.definitions = mod.definitions.filter(tbl => tbl.definitionGuid !== definitionReference.definitionGuid);
      }
    });

    this.store.dispatch({ type: DefinitionActions.SET_DEFINITIONS, payload: realmDefinitions });
  }

  setDefinitions(definitions: Untold.ClientModuleDefinitions[]) {
    this.store.dispatch({ type: DefinitionActions.SET_DEFINITIONS, payload: definitions });
  }

  getCurrent(): Untold.ClientModuleDefinitions[] {
    return this.current;
  }
}
