import {ActionReducer, Action} from '@ngrx/store';
import {SelectedGameActions} from '../actions/selected-game.actions';
import {Untold} from '../../shared/models/backend-export';

export function SelectedGameReducer(state = {}, action) {
    switch (action.type) {
        case SelectedGameActions.SET_SELECTED_GAME:
            return  action.payload ?  JSON.parse(JSON.stringify(action.payload)) : null;
        default:
            return state;
    };
}
