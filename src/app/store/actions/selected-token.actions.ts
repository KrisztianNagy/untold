import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {Token} from '../models/token';

@Injectable()
export class SelectedTokenActions {

    static SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN';
    setSelectedToken(token: Token): Action {
        return {
            type: SelectedTokenActions.SET_SELECTED_TOKEN,
            payload: token
        };
    }
}
