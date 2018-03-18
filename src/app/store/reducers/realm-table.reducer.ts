import { ActionReducer, Action } from '@ngrx/store';
import { RealmTableActions } from '../actions/realm-table.actions';
import { Untold } from '../../shared/models/backend-export';

export function RealmTableReducer(state = [], action) {
    switch (action.type) {
        case RealmTableActions.SET_REALMTABLES:
            return [...action.payload];
        default:
            return state;
    }
}
