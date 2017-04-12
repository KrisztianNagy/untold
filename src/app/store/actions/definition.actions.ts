import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { Untold } from '../../shared/models/backend-export';

@Injectable()
export class DefinitionActions {

    static SET_DEFINITIONS = 'SET_DEFINITIONS';

    setDefinitions(definitions: Array<Untold.ClientModuleDefinitions>): Action {
        return {
            type: DefinitionActions.SET_DEFINITIONS,
            payload: definitions
        };
    }
}
