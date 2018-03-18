import {ActionReducer, Action} from '@ngrx/store';
import {UserWallActions} from '../actions/user-wall.actions';
import {Wall} from '../models/wall';

export function UserWallReducer(state = [], action) {
    switch (action.type) {
        case UserWallActions.ADD_USERWALL:
            let id = 0;
            state.forEach((wall: Wall) => {
                id = id > wall.id ? id : wall.id;
            });

            action.payload.id = id + 1;
            return [...state, action.payload];
        case UserWallActions.DELETE_USERWALL:
            return state.filter(wall => wall.id !== action.payload.id);
        default:
            return state;
    }
}
