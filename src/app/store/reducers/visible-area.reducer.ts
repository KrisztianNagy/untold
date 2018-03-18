import {ActionReducer, Action} from '@ngrx/store';
import {VisibleAreaActions} from '../actions/visible-area.actions';
import {VisibleArea} from '../models/visible-area';

export function VisibleAreaReducer(state = [], action) {
    switch (action.type) {
        case VisibleAreaActions.SET_VISIBLEAREA:
            return action.payload;
        default:
            return state;
    }
}
