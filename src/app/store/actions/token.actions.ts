import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {Token} from '../models/token';

@Injectable()
export class TokenActions {

    static ADD_TOKENS = 'ADD_TOKENS';
    static UPDATE_TOKEN = 'UPDATE_TOKEN';

    addTokens(tokens: Token[]): Action {
        return {
            type: TokenActions.ADD_TOKENS,
            payload: tokens
        };
    }

    updateToken(token: Token): Action {
        return {
            type: TokenActions.UPDATE_TOKEN,
            payload: token
        };
    }
}
