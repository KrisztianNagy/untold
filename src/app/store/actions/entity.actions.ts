import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { Untold } from '../../shared/models/backend-export';

@Injectable()
export class EntityActions {

    static ADD_ENTITY = 'ADD_ENTITY';
    static SET_ENTITIES = 'ADD_ENTITIES';
    static UPDATE_ENTITY = 'UPDATE_ENTITY';
    static DELETE_ENTITY = 'DELETE_ENTITY';
    static KEEP_ENTITIES = 'KEEP_ENTITIES';

    addEntities(entities: Array<Untold.ClientEntity>): Action {
        return {
            type: EntityActions.SET_ENTITIES,
            payload: entities
        };
    }

    addEntity(entity: Untold.ClientEntity): Action {
        return {
            type: EntityActions.ADD_ENTITY,
            payload: entity
        };
    }

    keepEntities(entities: Untold.ClientEntity[]): Action {
        return {
            type: EntityActions.KEEP_ENTITIES,
            payload: entities
        };
    }

    updateEntity(entity: Untold.ClientEntity): Action {
        return {
            type: EntityActions.UPDATE_ENTITY,
            payload: entity
        };
    }

    deleteEntity(entity: Untold.ClientEntity): Action {
        return {
            type: EntityActions.DELETE_ENTITY,
            payload: entity
        };
    }
}
