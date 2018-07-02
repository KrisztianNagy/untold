import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppStore } from '../app-store';
import { Untold } from '../../shared/models/backend-export';
import { EntityActions } from '../actions/entity.actions';

@Injectable()
export class EntityService {
    entities: Observable<Untold.ClientEntity[]>;
    private current: Untold.ClientEntity[];

    constructor(private store: Store<AppStore>) {
    this.entities = this.store.select(s => s.Entities);

    this.entities.subscribe(rt => {
      this.current = rt;
    });
  }

  keepEntities(entities: Untold.ClientEntity[]) {
    this.store.dispatch({ type: EntityActions.KEEP_ENTITIES, payload: entities });
  }

  addEntity(entity: Untold.ClientEntity) {
    this.store.dispatch({ type: EntityActions.ADD_ENTITY, payload: entity });
  }

  updateEntity(entity: Untold.ClientEntity) {
    this.store.dispatch({ type: EntityActions.UPDATE_ENTITY, payload: entity });
  }

  deleteEntity(entity: Untold.ClientEntity) {
    this.store.dispatch({ type: EntityActions.DELETE_ENTITY, payload: entity });
  }

  getCurrent(): Untold.ClientEntity[] {
    return this.current;
  }
}
