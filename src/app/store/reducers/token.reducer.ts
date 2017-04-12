import {ActionReducer, Action} from '@ngrx/store';
import {TokenActions} from '../actions/token.actions';
import {Token} from '../models/token';

export function TokenReducer(state = [], action) {
    switch (action.type) {
        case TokenActions.ADD_TOKENS:
            return [...state, ...action.payload];
        case TokenActions.UPDATE_TOKEN:
            return state.
                map((token: Token) => {
                    return token.id === action.payload.id ? Object.assign({}, token, action.payload) : token;
            });
        default:
            return state;
    };
}
