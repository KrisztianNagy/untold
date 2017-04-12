import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {Wall} from '../models/wall';

@Injectable()
export class WallActions {

    static ADD_WALL = 'ADD_WALL';
    static UPDATE_WALL = 'UPDATE_WALL';
    static SET_WALLS = 'SET_WALLS';

    addWall(wall: Wall): Action {
        return {
            type: WallActions.ADD_WALL,
            payload: wall
        };
    }

    updateWall(wall: Wall): Action {
        return {
            type: WallActions.UPDATE_WALL,
            payload: wall
        };
    }

    setWalls(walls: Wall[]): Action {
        return {
            type: WallActions.SET_WALLS,
            payload: walls
        };
    }
}
