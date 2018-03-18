import {ActionReducer, Action} from '@ngrx/store';
import {SelectedTokenActions} from '../actions/selected-token.actions';
import {Token} from '../models/token';

export function SelectedTokenReducer(state = {}, action) {
    switch (action.type) {
        case SelectedTokenActions.SET_SELECTED_TOKEN:
            return  action.payload ?  JSON.parse(JSON.stringify(action.payload)) : null;
        default:
            return state;
    }
}
