import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {Untold} from '../../shared/models/backend-export';

@Injectable()
export class RealmTableActions {

    static SET_REALMTABLES = 'SET_REALMTABLES';
    setInteraction(realmTables: Untold.ClientRealmTables): Action {
        return <Action> {
            type: RealmTableActions.SET_REALMTABLES,
            payload: realmTables
        };
    }
}
