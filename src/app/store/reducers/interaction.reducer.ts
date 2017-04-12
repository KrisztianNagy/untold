import {ActionReducer, Action} from '@ngrx/store';
import {InteractionActions} from '../actions/interaction.actions';
import {Interaction} from '../models/Interaction';

export function InteractionReducer(state = [], action) {
    switch (action.type) {
        case InteractionActions.SET_INTERACTION:
            return action.payload;
        default:
            return state;
    };
}
