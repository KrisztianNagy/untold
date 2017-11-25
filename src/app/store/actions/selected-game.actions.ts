import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {Untold} from '../../shared/models/backend-export';

@Injectable()
export class SelectedGameActions {

    static SET_SELECTED_GAME = 'SET_SELECTED_GAME';
    setSelectedToken(game: Untold.ClientGameRealmDetails): Action {
        return <Action> {
            type: SelectedGameActions.SET_SELECTED_GAME,
            payload: game
        };
    }
}
