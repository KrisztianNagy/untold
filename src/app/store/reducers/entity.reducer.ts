import { ActionReducer, Action } from '@ngrx/store';
import { EntityActions } from '../actions/entity.actions';
import { Untold } from '../../shared/models/backend-export';

export function EntityReducer(state = [], action) {
    switch (action.type) {
        case EntityActions.SET_ENTITIES:
            return [...action.payload];
        case EntityActions.ADD_ENTITY:
            return [...state, action.payload];
        case EntityActions.UPDATE_ENTITY:
            return state.
                map((entity: Untold.ClientEntity) => {
                    return entity.id === action.payload.id ? Object.assign({}, entity, action.payload) : entity;
            });
        case EntityActions.DELETE_ENTITY:
            return state.filter(entity =>
                entity.id !== action.payload.id);
        default:
            return state;
    };
}
