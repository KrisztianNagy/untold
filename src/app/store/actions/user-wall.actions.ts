import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {Wall} from '../models/wall';

@Injectable()
export class UserWallActions {

    static ADD_USERWALL = 'ADD_USERWALL';
    static DELETE_USERWALL = 'DELETE_USERWALL';

    addWall(wall: Wall): Action {
        return <Action> {
            type: UserWallActions.ADD_USERWALL,
            payload: wall
        };
    }

    setWalls(wall: Wall): Action {
        return <Action> {
            type: UserWallActions.DELETE_USERWALL,
            payload: wall
        };
    }
}
