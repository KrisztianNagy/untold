import { ActionReducer, Action } from '@ngrx/store';
import { DefinitionActions } from '../actions/definition.actions';
import { Untold } from '../../shared/models/backend-export';

export function DefinitonReducer(state = [], action) {
    switch (action.type) {
        case DefinitionActions.SET_DEFINITIONS:
            return [...action.payload];
        default:
            return state;
    };
}
