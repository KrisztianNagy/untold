import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {GridTile} from '../models/grid-tile';

@Injectable()
export class GridTileActions {

    static ADD_GRID = 'ADD_GRID';
    static UPDATE_GRIDTILE = 'UPDATE_GRIDTILE';

    addGrid(gridTiles: GridTile[]): Action {
        return {
            type: GridTileActions.ADD_GRID,
            payload: gridTiles
        };
    }

    updateGridTile(gridTile: GridTile): Action {
        return {
            type: GridTileActions.UPDATE_GRIDTILE,
            payload: gridTile
        };
    }
}
