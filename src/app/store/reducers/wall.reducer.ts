import {ActionReducer, Action} from '@ngrx/store';
import {WallActions} from '../actions/wall.actions';
import {Wall} from '../models/wall';

export function WallReducer(state = [], action) {
    switch (action.type) {
        case WallActions.ADD_WALL:
            return [...action.payload];
        case WallActions.SET_WALLS:
            return action.payload;
        case WallActions.UPDATE_WALL:
            return [...action.payload];
        default:
            return state;
    }
}
