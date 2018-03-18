import { ActionReducer, Action } from '@ngrx/store';
import { EntityActions } from '../actions/entity.actions';
import { Untold } from '../../shared/models/backend-export';

export function EntityReducer(state = [], action) {
    switch (action.type) {
        case EntityActions.ADD_ENTITY:
            const found = state.some((storeEntity: Untold.ClientEntity) => storeEntity.id === (<Untold.ClientEntity> action.payload).id);

            if (found) {
                return [... state.filter((storeEntity: Untold.ClientEntity) => {
                    return storeEntity.id === (<Untold.ClientEntity> action.payload).id ?
                        action.payload : storeEntity;
                })];
            }

            return [...state, action.payload];
        case EntityActions.UPDATE_ENTITY:
            return state.
                map((entity: Untold.ClientEntity) => {
                    return entity.id === action.payload.id ? Object.assign({}, entity, action.payload) : entity;
            });
        case EntityActions.DELETE_ENTITY:
            return state.filter(entity =>
                entity.id !== action.payload.id);
        case EntityActions.KEEP_ENTITIES:
            return state.filter((storeEntity: Untold.ClientEntity) => {
                const match = (<Untold.ClientEntity[]> action.payload).some(entity => storeEntity.id === entity.id);
                return match;
            });
        default:
            return state;
    }
}
