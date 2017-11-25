import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {VisibleArea} from '../models/visible-area';

@Injectable()
export class VisibleAreaActions {

    static SET_VISIBLEAREA = 'SET_VISIBLEAREA';
    setVisibleArea(visibleArea: VisibleArea): Action {
        return <Action> {
            type: VisibleAreaActions.SET_VISIBLEAREA,
            payload: visibleArea
        };
    }
}
