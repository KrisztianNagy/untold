import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {Interaction} from '../models/interaction';

@Injectable()
export class InteractionActions {

    static SET_INTERACTION = 'SET_INTERACTION';
    setInteraction(interaction: Interaction): Action {
        return {
            type: InteractionActions.SET_INTERACTION,
            payload: interaction
        };
    }
}
